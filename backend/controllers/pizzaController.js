import Pizza from '../models/Pizza.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

/**
 * Get all pizzas (Paginated, Searchable, Filterable, Sortable)
 */
export const getPizzas = async (req, res, next) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '12', 10);
  const search = req.query.search || '';
  const category = req.query.category || '';
  const isAvailable = req.query.isAvailable;
  const sort = req.query.sort || '-createdAt';

  const skip = (page - 1) * limit;

  try {
    const query = {};

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Availability filter
    if (isAvailable !== undefined && isAvailable !== 'all') {
      query.isAvailable = isAvailable === 'true';
    }

    // Sort order definition
    let sortObj = {};
    if (sort === 'price_asc') {
      sortObj = { price: 1 };
    } else if (sort === 'price_desc') {
      sortObj = { price: -1 };
    } else if (sort === 'rating_desc') {
      sortObj = { 'ratings.average': -1 };
    } else {
      sortObj = { createdAt: -1 };
    }

    const total = await Pizza.countDocuments(query);
    const pizzas = await Pizza.find(query)
      .populate('ingredients.ingredient', 'name quantity unit')
      .skip(skip)
      .limit(limit)
      .sort(sortObj);

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      pizzas
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single pizza by ID
 */
export const getPizzaById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pizza = await Pizza.findById(id).populate('ingredients.ingredient', 'name quantity unit');
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza not found' });
    }
    res.status(200).json({ success: true, pizza });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin ONLY: Create new Pizza product
 */
export const createPizza = async (req, res, next) => {
  const { name, description, price, category, isCustomizable, ingredients } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Pizza image file is required' });
    }

    // Upload image buffer to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'pizzas');

    // Parse ingredients array
    let parsedIngredients = [];
    if (ingredients) {
      parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    }

    const newPizza = await Pizza.create({
      name,
      description,
      price: parseFloat(price),
      category,
      isCustomizable: isCustomizable === 'true' || isCustomizable === true,
      image: uploadResult.secure_url,
      ingredients: parsedIngredients
    });

    res.status(201).json({
      success: true,
      message: 'Pizza product created successfully',
      pizza: newPizza
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin ONLY: Update Pizza
 */
export const updatePizza = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, price, category, isCustomizable, ingredients, isAvailable } = req.body;

  try {
    const pizza = await Pizza.findById(id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza product not found' });
    }

    if (name) pizza.name = name;
    if (description) pizza.description = description;
    if (price) pizza.price = parseFloat(price);
    if (category) pizza.category = category;
    if (isAvailable !== undefined) pizza.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (isCustomizable !== undefined) pizza.isCustomizable = isCustomizable === 'true' || isCustomizable === true;

    if (ingredients) {
      pizza.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    }

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'pizzas');
      pizza.image = uploadResult.secure_url;
    }

    await pizza.save();

    res.status(200).json({
      success: true,
      message: 'Pizza product updated successfully',
      pizza
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin ONLY: Delete Pizza
 */
export const deletePizza = async (req, res, next) => {
  const { id } = req.params;

  try {
    const pizza = await Pizza.findByIdAndDelete(id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza product not found' });
    }
    res.status(200).json({ success: true, message: 'Pizza product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * User: Add Review and rating
 */
export const addPizzaReview = async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const pizza = await Pizza.findById(id);
    if (!pizza) {
      return res.status(404).json({ success: false, message: 'Pizza product not found' });
    }

    // Check if user has already reviewed
    const alreadyReviewed = pizza.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      // Update existing review
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      alreadyReviewed.createdAt = new Date();
    } else {
      // Add new review
      pizza.reviews.push({
        user: req.user._id,
        userName: req.user.name,
        rating: Number(rating),
        comment
      });
    }

    // Recalculate average rating
    pizza.ratings.count = pizza.reviews.length;
    pizza.ratings.average =
      pizza.reviews.reduce((acc, r) => acc + r.rating, 0) / pizza.reviews.length;

    await pizza.save();

    res.status(200).json({
      success: true,
      message: alreadyReviewed ? 'Review updated successfully' : 'Review added successfully',
      pizza
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all unique Pizza categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Pizza.distinct('category');
    // Ensure 'Veg' and 'Non-Veg' are returned even if database is empty
    const uniqueCategories = Array.from(new Set([...categories, 'Veg', 'Non-Veg']));
    res.status(200).json({
      success: true,
      categories: uniqueCategories
    });
  } catch (error) {
    next(error);
  }
};
