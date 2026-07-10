import Inventory from '../models/Inventory.js';

/**
 * Get all inventory items (Paginated, Searchable)
 */
export const getInventory = async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '20', 10);
  const search = req.query.search || '';

  const skip = (page - 1) * limit;

  try {
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Inventory.countDocuments(query);
    const items = await Inventory.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      inventory: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get low stock inventory items
 */
export const getLowStockItems = async (req, res, next) => {
  try {
    const items = await Inventory.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });
    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Add new ingredient item
 */
export const addInventoryItem = async (req, res, next) => {
  const { name, quantity, unit, lowStockThreshold } = req.body;

  try {
    const existing = await Inventory.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ingredient already exists in inventory' });
    }

    const item = await Inventory.create({
      name,
      quantity: Number(quantity),
      unit,
      lowStockThreshold: Number(lowStockThreshold || 10)
    });

    res.status(201).json({
      success: true,
      message: 'Ingredient added successfully',
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update quantity or threshold of ingredient
 */
export const updateInventoryItem = async (req, res, next) => {
  const { id } = req.params;
  const { quantity, lowStockThreshold, name, unit } = req.body;

  try {
    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    if (name) item.name = name;
    if (unit) item.unit = unit;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Ingredient stock updated successfully',
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete ingredient
 */
export const deleteInventoryItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }
    res.status(200).json({ success: true, message: 'Ingredient deleted from inventory' });
  } catch (error) {
    next(error);
  }
};
