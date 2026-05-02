module.exports = {
  success: (res, data, message = '操作成功', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  error: (res, message = '操作失败', statusCode = 400, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  },

  paginate: (res, data, pagination) => {
    return res.status(200).json({
      success: true,
      data,
      pagination
    });
  }
};
