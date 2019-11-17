const findOneRec = model => async (req, res, next) => {
  const result = await model.findById(req.params.id);
  if (!result) {
    return res.status(404).json({
      success: false,
      error: `No document with id of ${req.params.id}`
    });
  }
  res.result = result;
  next();
};

module.exports = findOneRec;
