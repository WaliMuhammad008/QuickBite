import React from "react";
import {
  FaGlassMartiniAlt,
  FaUtensils,
  FaPepperHot,
  FaFire,
} from "react-icons/fa";

// Asset references for combo sub-items
import burgerImg from "../../../assets/Burger.jpg";
import shawarmaImg from "../../../assets/shawarama.jpg";
import wrapImg from "../../../assets/wraps.jpg";
import pizzaImg from "../../../assets/pizza.png";
import broastImg from "../../../assets/broast.jpg";
import wingsImg from "../../../assets/grilledwings.jpg";
import friesImg from "../../../assets/potatocorner.jpg";
import drinksImg from "../../../assets/Drinks.jpg";
import saucesImg from "../../../assets/sauces.jpg";
import pastaImg from "../../../assets/pasta.jpg";

export const DEFAULT_DRINK_FLAVORS = [
  "Coca-Cola",
  "Sprite",
  "Fanta",
  "7Up",
  "Mountain Dew",
  "Pepsi",
];
export const DEFAULT_PIZZA_FLAVORS = [
  "Chicken Tikka",
  "Chicken Fajita",
  "Peri Peri",
  "Supreme",
];
export const DEFAULT_FRIES_FLAVORS = [
  "Plain Salted",
  "Masala Fries",
  "Garlic Mayo Fries",
];

export const getSubItemImage = (itemName = "") => {
  const name = (itemName || "").toLowerCase();
  if (
    name.includes("burger") ||
    name.includes("patty") ||
    name.includes("zinger")
  )
    return burgerImg;
  if (name.includes("shawarma")) return shawarmaImg;
  if (name.includes("wrap")) return wrapImg;
  if (name.includes("pizza")) return pizzaImg;
  if (
    name.includes("broast") ||
    name.includes("fried chicken") ||
    name.includes("chicken")
  )
    return broastImg;
  if (name.includes("wing")) return wingsImg;
  if (name.includes("fries") || name.includes("potato")) return friesImg;
  if (
    name.includes("drink") ||
    name.includes("ml") ||
    name.includes("1.5l") ||
    name.includes("coke") ||
    name.includes("pepsi")
  )
    return drinksImg;
  if (name.includes("sauce") || name.includes("dip") || name.includes("mayo"))
    return saucesImg;
  if (name.includes("pasta")) return pastaImg;
  return friesImg;
};

export const parseComboItems = (description = "", dbItems = []) => {
  if (Array.isArray(dbItems) && dbItems.length > 0) {
    return dbItems.map((it, idx) => {
      const name = it.item_title || it.name || "Item";
      const lname = name.toLowerCase();
      const isDrink =
        lname.includes("drink") ||
        lname.includes("ml") ||
        lname.includes("1.5l") ||
        lname.includes("coke") ||
        lname.includes("pepsi");
      const isPizza = lname.includes("pizza");
      const isFries = lname.includes("fries") || lname.includes("potato");

      const isChoice = it.flavor_mode === 'choice' || Boolean(it.is_customizable);
      return {
        id: it.id || idx,
        raw: `${it.quantity || 1}x ${name}`,
        qty: `${it.quantity || 1}X`,
        quantity: it.quantity || 1,
        name: name,
        category: it.category || "",
        size: it.size || "Regular",
        flavor_name: it.flavor_name || "",
        flavor_mode: it.flavor_mode || (isChoice ? "choice" : "fixed"),
        menu_item_id: it.menu_item_id || 0,
        isDrink,
        isPizza,
        isFries,
        is_customizable: isChoice,
        choice_group_name:
          it.choice_group_name ||
          (isPizza
            ? "Choose Pizza Flavor"
            : isFries
              ? "Choose Fries Flavor"
              : isDrink
                ? "Choose Drink Flavor"
                : `Choose ${name} Flavor`),
        options:
          Array.isArray(it.options) && it.options.length > 0
            ? it.options
            : isPizza
              ? DEFAULT_PIZZA_FLAVORS
              : isFries
                ? DEFAULT_FRIES_FLAVORS
                : isDrink
                  ? DEFAULT_DRINK_FLAVORS
                  : [],
        image: getSubItemImage(name),
      };
    });
  }

  if (!description) return [];
  const rawParts = description
    .split(/\+|\band\b|,/i)
    .map((s) => s.trim())
    .filter(Boolean);
  return rawParts.map((part, index) => {
    const qtyMatch = part.match(/^(\d+\s*x|\d+\s*pcs|\d+|quarter)\s+/i);
    let qty = "1X";
    let name = part;
    if (qtyMatch) {
      qty = qtyMatch[1].toLowerCase().includes("x")
        ? qtyMatch[1].toUpperCase()
        : qtyMatch[1].toLowerCase().includes("pcs")
          ? qtyMatch[1].toUpperCase()
          : `${qtyMatch[1]}X`;
      name = part.replace(qtyMatch[0], "").trim();
    }
    const lname = name.toLowerCase();
    const isDrink =
      lname.includes("drink") ||
      lname.includes("ml") ||
      lname.includes("1.5l") ||
      lname.includes("coke") ||
      lname.includes("pepsi");
    const isPizza = lname.includes("pizza");
    const isFries = lname.includes("fries") || lname.includes("potato");
    return {
      id: index,
      raw: part,
      qty: qty,
      name: name || part,
      isDrink,
      isPizza,
      isFries,
      is_customizable: isPizza || isFries || isDrink,
      choice_group_name: isPizza
        ? "Choose Pizza Flavor"
        : isFries
          ? "Choose Fries Flavor"
          : isDrink
            ? "Choose Drink Flavor"
            : "",
      options: isPizza
        ? DEFAULT_PIZZA_FLAVORS
        : isFries
          ? DEFAULT_FRIES_FLAVORS
          : isDrink
            ? DEFAULT_DRINK_FLAVORS
            : [],
      image: getSubItemImage(name || part),
    };
  });
};

export const getCategoryIcon = (categoryName = "") => {
  const cat = (categoryName || "").toLowerCase();
  if (cat.includes("drink") || cat.includes("beverage"))
    return <FaGlassMartiniAlt className="text-red-500 text-sm" />;
  if (cat.includes("fries") || cat.includes("potato"))
    return <FaUtensils className="text-amber-500 text-sm" />;
  if (cat.includes("sauce") || cat.includes("sause") || cat.includes("dip"))
    return <FaPepperHot className="text-red-500 text-sm" />;
  if (
    cat.includes("pairing") ||
    cat.includes("side") ||
    cat.includes("appetizer") ||
    cat.includes("wing") ||
    cat.includes("bread") ||
    cat.includes("nugget")
  ) {
    return <FaFire className="text-amber-500 text-sm" />;
  }
  if (
    cat.includes("wrap") ||
    cat.includes("shawarma") ||
    cat.includes("burger")
  )
    return <FaFire className="text-orange-500 text-sm" />;
  return <FaUtensils className="text-amber-500 text-sm" />;
};
