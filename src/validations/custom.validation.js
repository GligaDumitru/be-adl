const customPasswordValidation = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message("Password must be at least 8 characters");
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message(
      "Password must contain at least 1 letter and 1 number"
    );
  }
  return value;
};

const objectId = (value, helpers) => {
  if(!value.match(/^[0-9a-fA-F]{24}$/)){
    return helpers.message('The id is not a valid mongodb id')
  }
  return value;
}

module.exports = {
  customPasswordValidation,
  objectId
};
