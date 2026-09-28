<?php
/**
 * DealInventoryHelper
 * Evaluates deals and their bundled items against live inventory and recipe mappings.
 * Supports both Dynamic Choice Slots (Category -> Size -> Product Checkboxes) and legacy deals.
 */
class DealInventoryHelper {

    private static $initialized = false;
    private static $inventoryMap = [];      // [id => ['name' => ..., 'stock' => ...]]
    private static $inventoryByName = [];   // [lower_name => id]
    private static $recipesByItem = [];     // [menu_item_id => [variant_lower => [recipes]]]
    private static $menuItemsById = [];     // [id => row]
    private static $menuItemsByName = [];   // [lower_name => row]

    public static function init(PDO $db) {
        if (self::$initialized) return;

        // 1. Fetch live inventory
        $stmt = $db->query("SELECT id, name, stock, unit, threshold FROM inventory");
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $id = intval($row['id']);
                $stock = floatval($row['stock']);
                self::$inventoryMap[$id] = [
                    'id' => $id,
                    'name' => $row['name'],
                    'stock' => $stock,
                    'unit' => $row['unit'],
                    'threshold' => floatval($row['threshold'])
                ];
                self::$inventoryByName[strtolower(trim($row['name']))] = $id;
            }
        }

        // 2. Fetch all menu items
        $mStmt = $db->query("SELECT id, name, category, isAvailable FROM menu_items");
        if ($mStmt) {
            while ($row = $mStmt->fetch(PDO::FETCH_ASSOC)) {
                $mId = intval($row['id']);
                self::$menuItemsById[$mId] = $row;
                self::$menuItemsByName[strtolower(trim($row['name']))] = $row;
            }
        }

        // 3. Fetch all recipes
        $rStmt = $db->query("SELECT r.menu_item_id, LOWER(TRIM(COALESCE(r.variant_name, ''))) as variant_name, 
                                    r.inventory_id, r.quantity_to_deduct 
                             FROM recipes r");
        if ($rStmt) {
            while ($rRow = $rStmt->fetch(PDO::FETCH_ASSOC)) {
                $mId = intval($rRow['menu_item_id']);
                $vName = $rRow['variant_name'];
                $invId = intval($rRow['inventory_id']);
                $qty = floatval($rRow['quantity_to_deduct']);

                self::$recipesByItem[$mId][$vName][] = [
                    'inventory_id' => $invId,
                    'quantity' => $qty
                ];
            }
        }

        self::$initialized = true;
    }

    /**
     * Check if a specific inventory item has sufficient stock
     */
    public static function hasStock($inventoryId, $neededQty = 0) {
        if (!isset(self::$inventoryMap[$inventoryId])) return false;
        $stock = self::$inventoryMap[$inventoryId]['stock'];
        if ($neededQty > 0) {
            return ($stock > 0 && $stock >= $neededQty);
        }
        return ($stock > 0);
    }

    /**
     * Check stock by ingredient name keyword (e.g. 'Pizza Dough', 'Mozzarella Cheese')
     */
    public static function hasStockByNameKeyword($keyword) {
        $kw = strtolower(trim($keyword));
        // Alias mapping for common culinary keywords to actual inventory names
        $aliases = [
            'mozzarella' => ['mozarella', 'cheese', 'chadder'],
            'broast cut' => ['chicken leg', 'chicken breast', 'chicken thaigh'],
            'broast' => ['chicken leg', 'chicken breast', 'chicken thaigh'],
            'zinger patty' => ['chicken patty', 'boneless chicken'],
            'patty' => ['chicken patty', 'boneless chicken'],
            'potato fries' => ['potato'],
            'fries' => ['potato'],
            'tortilla' => ['shawarama bread', 'paratha'],
            'pita' => ['shawarama bread'],
            'shawarma' => ['shawarama bread', 'paratha'],
            'wings' => ['chicken wings'],
            'dip' => ['garlic mayo', 'white mayonise', 'sause'],
            'garlic dip' => ['garlic mayo', 'white mayonise']
        ];

        $targets = [$kw];
        if (isset($aliases[$kw])) {
            $targets = array_merge($targets, $aliases[$kw]);
        }

        foreach (self::$inventoryMap as $inv) {
            $invLower = strtolower($inv['name']);
            foreach ($targets as $tgt) {
                if (strpos($invLower, $tgt) !== false) {
                    return floatval($inv['stock']) > 0;
                }
            }
        }
        return true; // Not found in tracked inventory, assume pass
    }

    /**
     * Evaluate if a specific product (and optional variant) can be prepared
     */
    public static function isProductInStock($menuItemId, $variantName = '') {
        $mId = intval($menuItemId);
        if ($mId <= 0 || !isset(self::$recipesByItem[$mId])) {
            return true; // No recipe required
        }

        $vLower = strtolower(trim($variantName));
        $recipes = [];

        // Check exact variant match first
        if (!empty($vLower) && isset(self::$recipesByItem[$mId][$vLower])) {
            $recipes = self::$recipesByItem[$mId][$vLower];
        } elseif (isset(self::$recipesByItem[$mId]['regular'])) {
            $recipes = self::$recipesByItem[$mId]['regular'];
        } elseif (isset(self::$recipesByItem[$mId][''])) {
            $recipes = self::$recipesByItem[$mId][''];
        } else {
            // Check any variant recipe
            $firstVariant = reset(self::$recipesByItem[$mId]);
            $recipes = $firstVariant ?: [];
        }

        foreach ($recipes as $r) {
            $invId = $r['inventory_id'];
            $needed = $r['quantity'];
            if (!self::hasStock($invId, $needed)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate an individual deal item slot
     * Returns: ['inStock' => bool, 'options' => array, 'structured_data' => array]
     */
    public static function evaluateDealSlot($it) {
        $title = trim($it['item_title'] ?? '');
        $titleLower = strtolower($title);
        $choiceGroupName = trim($it['choice_group_name'] ?? '');
        $choiceGroupLower = strtolower($choiceGroupName);

        $rawOptions = [];
        if (!empty($it['options_json'])) {
            $rawOptions = is_string($it['options_json']) ? json_decode($it['options_json'], true) : $it['options_json'];
        }

        $slotInStock = true;
        $normalizedOptions = [];

        // --- 1. DETECT DYNAMIC BUNDLE CHOICE STRUCTURE ---
        // Expected format: {"type":"choice", "category":"Pizza", "variant_name":"Medium", "allowed_products":[...]}
        $isStructuredChoice = is_array($rawOptions) && isset($rawOptions['type']) && $rawOptions['type'] === 'choice';
        
        if ($isStructuredChoice) {
            $category = trim($rawOptions['category'] ?? '');
            $variantName = trim($rawOptions['variant_name'] ?? '');
            $allowedProducts = is_array($rawOptions['allowed_products'] ?? null) ? $rawOptions['allowed_products'] : [];

            // 1.1 Category-Level Base / Common Ingredient Checks
            $catLower = strtolower($category);
            if ($catLower === 'pizza' || strpos($titleLower, 'pizza') !== false) {
                // Pizza MUST have Pizza Dough (ID 10) and Mozzarella Cheese (ID 14)
                if (!self::hasStockByNameKeyword('Pizza Dough') || !self::hasStockByNameKeyword('Mozzarella')) {
                    $slotInStock = false;
                }
            } elseif ($catLower === 'burgers' || strpos($titleLower, 'burger') !== false) {
                // Burgers MUST have Burger Buns
                if (!self::hasStockByNameKeyword('Burger Bun')) {
                    $slotInStock = false;
                }
            } elseif ($catLower === 'broast' || strpos($titleLower, 'broast') !== false) {
                // Broast MUST have Raw Chicken Broast Cut
                if (!self::hasStockByNameKeyword('Broast Cut')) {
                    $slotInStock = false;
                }
            }

            // 1.2 Evaluate each allowed product flavor
            $anyOptionInStock = false;
            foreach ($allowedProducts as $prod) {
                $pId = intval($prod['id'] ?? 0);
                $pName = trim($prod['name'] ?? '');
                
                $prodInStock = true;
                if ($pId > 0) {
                    $prodInStock = self::isProductInStock($pId, $variantName);
                } elseif (!empty($pName) && isset(self::$menuItemsByName[strtolower($pName)])) {
                    $matched = self::$menuItemsByName[strtolower($pName)];
                    $prodInStock = self::isProductInStock($matched['id'], $variantName);
                }

                if ($prodInStock) {
                    $anyOptionInStock = true;
                }

                $normalizedOptions[] = [
                    'id' => $pId,
                    'name' => $pName,
                    'inStock' => $prodInStock
                ];
            }

            // If common ingredients are missing OR all flavor options are depleted:
            if (!$anyOptionInStock || count($allowedProducts) === 0) {
                $slotInStock = false;
            }

            return [
                'inStock' => $slotInStock,
                'options' => $normalizedOptions,
                'structured_data' => $rawOptions
            ];
        }

        // --- 2. LEGACY / STANDARD DEAL ITEMS ---
        // 2.1 Check if this item represents a Pizza (Title or Choice Group mentions pizza)
        $isPizzaSlot = (strpos($titleLower, 'pizza') !== false || strpos($choiceGroupLower, 'pizza') !== false);
        if ($isPizzaSlot) {
            // Fresh Pizza Dough (ID 10) & Mozzarella Cheese (ID 14) are strictly mandatory
            if (!self::hasStockByNameKeyword('Pizza Dough') || !self::hasStockByNameKeyword('Mozzarella')) {
                $slotInStock = false;
            }
        }

        // 2.2 Check Burger, Broast, Wrap, Fries keywords on slot
        if (strpos($titleLower, 'burger') !== false && !self::hasStockByNameKeyword('Burger Bun')) {
            $slotInStock = false;
        }
        if (strpos($titleLower, 'zinger') !== false && !self::hasStockByNameKeyword('Zinger Patty')) {
            $slotInStock = false;
        }
        if (strpos($titleLower, 'broast') !== false && !self::hasStockByNameKeyword('Broast Cut')) {
            $slotInStock = false;
        }
        if ((strpos($titleLower, 'wrap') !== false || strpos($titleLower, 'shawarma') !== false) && 
            (!self::hasStockByNameKeyword('Tortilla') && !self::hasStockByNameKeyword('Pita') && !self::hasStockByNameKeyword('Paratha'))) {
            $slotInStock = false;
        }
        if (strpos($titleLower, 'fries') !== false && !self::hasStockByNameKeyword('Potato Fries')) {
            $slotInStock = false;
        }

        // 2.3 Check linked menu_item_id or match flavor_name / item_title to menu catalog
        $slotSize = trim($it['size'] ?? '');
        $slotFlavor = trim($it['flavor_name'] ?? '');
        $slotFlavorMode = trim($it['flavor_mode'] ?? 'fixed');

        $linkedMenuId = intval($it['menu_item_id'] ?? 0);
        if ($linkedMenuId <= 0 && !empty($slotFlavor)) {
            $fLower = strtolower($slotFlavor);
            if (isset(self::$menuItemsByName[$fLower])) {
                $linkedMenuId = intval(self::$menuItemsByName[$fLower]['id']);
            }
        }
        if ($linkedMenuId <= 0 && !empty($titleLower)) {
            $cleanTitle = trim(preg_replace('/^(Large|Medium|Small|Quarter|Plain)\s+/i', '', $titleLower));
            $cleanTitleNoS = rtrim($cleanTitle, 's');
            if (isset(self::$menuItemsByName[$titleLower])) {
                $linkedMenuId = intval(self::$menuItemsByName[$titleLower]['id']);
            } elseif (isset(self::$menuItemsByName[$cleanTitle])) {
                $linkedMenuId = intval(self::$menuItemsByName[$cleanTitle]['id']);
            } elseif (isset(self::$menuItemsByName[$cleanTitleNoS])) {
                $linkedMenuId = intval(self::$menuItemsByName[$cleanTitleNoS]['id']);
            }
        }
        if ($linkedMenuId > 0) {
            $variant = !empty($slotSize) ? strtolower($slotSize) : '';
            if (empty($variant)) {
                if (strpos($titleLower, 'large') !== false) $variant = 'large';
                elseif (strpos($titleLower, 'medium') !== false) $variant = 'medium';
                elseif (strpos($titleLower, 'small') !== false) $variant = 'small';
            }
            if (!self::isProductInStock($linkedMenuId, $variant)) {
                $slotInStock = false;
            }
        }

        // 2.4 If customizable with an array of options (strings or objects)
        if (is_array($rawOptions) && count($rawOptions) > 0) {
            $anyOptionInStock = false;

            foreach ($rawOptions as $opt) {
                $optName = is_string($opt) ? trim($opt) : trim($opt['name'] ?? $opt['title'] ?? '');
                $optId = is_array($opt) && isset($opt['id']) ? intval($opt['id']) : 0;

                // Try to resolve option to a real catalog menu item
                $optLower = strtolower($optName);
                $flavorInStock = true;

                if ($optId > 0) {
                    $flavorInStock = self::isProductInStock($optId, !empty($slotSize) ? strtolower($slotSize) : '');
                } elseif (isset(self::$menuItemsByName[$optLower])) {
                    $matched = self::$menuItemsByName[$optLower];
                    $flavorInStock = self::isProductInStock($matched['id'], !empty($slotSize) ? strtolower($slotSize) : '');
                } elseif ($isPizzaSlot) {
                    // Pizza flavor keyword check
                    if (strpos($optLower, 'tikka') !== false || strpos($optLower, 'fajita') !== false || strpos($optLower, 'fagitta') !== false) {
                        $flavorInStock = self::hasStockByNameKeyword('Boneless Chicken');
                    }
                }

                if ($flavorInStock) {
                    $anyOptionInStock = true;
                }

                $normalizedOptions[] = [
                    'id' => $optId,
                    'name' => $optName,
                    'inStock' => $flavorInStock
                ];
            }

            // If all options in a customizable slot are depleted, slot is out of stock
            if (!$anyOptionInStock) {
                $slotInStock = false;
            }
        } elseif ($isPizzaSlot && empty($rawOptions)) {
            // Default pizza flavors if empty options array (e.g. Deal 8)
            $defaultFlavors = ["Chicken Tikka", "Chicken Fajita", "Peri Peri", "Supreme"];
            $hasBoneless = self::hasStockByNameKeyword('Boneless Chicken');
            foreach ($defaultFlavors as $df) {
                $inStk = true;
                if ((strpos(strtolower($df), 'tikka') !== false || strpos(strtolower($df), 'fajita') !== false) && !$hasBoneless) {
                    $inStk = false;
                }
                $normalizedOptions[] = [
                    'name' => $df,
                    'inStock' => $inStk
                ];
            }
        }

        return [
            'inStock' => $slotInStock,
            'options' => $normalizedOptions,
            'structured_data' => $rawOptions
        ];
    }

    /**
     * Evaluates all deal items and updates the deal array with inStock and clean items
     */
    public static function processDeal(&$deal, $rawItems) {
        $itemsList = [];
        $descParts = [];
        $dealInStock = true;

        foreach ($rawItems as $it) {
            $slotEval = self::evaluateDealSlot($it);
            
            if (!$slotEval['inStock']) {
                $dealInStock = false;
            }

            $options = $slotEval['options'];
            if (empty($options) && !empty($it['options_json'])) {
                $options = is_string($it['options_json']) ? json_decode($it['options_json'], true) : $it['options_json'];
            }

            $itemsList[] = [
                'id' => $it['id'],
                'menu_item_id' => intval($it['menu_item_id'] ?? 0),
                'category' => $it['category'] ?? '',
                'item_title' => $it['item_title'],
                'size' => $it['size'] ?? 'Regular',
                'flavor_name' => $it['flavor_name'] ?? '',
                'flavor_mode' => $it['flavor_mode'] ?? 'fixed',
                'quantity' => intval($it['quantity'] ?? 1),
                'is_customizable' => intval($it['is_customizable'] ?? 0) === 1,
                'choice_group_name' => $it['choice_group_name'] ?? '',
                'options' => $options,
                'slot_in_stock' => $slotEval['inStock'],
                'structured_data' => $slotEval['structured_data'] ?? null
            ];

            $rawTitle = trim($it['item_title'] ?? '');
            if (preg_match('/^\d+\s*x\s+/i', $rawTitle)) {
                $descParts[] = $rawTitle;
            } else {
                $descParts[] = ($it['quantity'] > 1 ? $it['quantity'] . 'x ' : '1x ') . $rawTitle;
            }
        }

        $deal['items'] = $itemsList;
        $deal['badge_tag'] = $deal['badge_tag'] ?? $deal['tag'] ?? 'DEAL';
        $deal['items_description'] = !empty($deal['description']) 
            ? $deal['description'] 
            : (count($descParts) > 0 ? implode(' + ', $descParts) : 'Exclusive Combo Deal');
        
        $deal['isAvailable'] = (bool)$dealInStock;
        $deal['inStock'] = (bool)$dealInStock;
    }
}
?>
