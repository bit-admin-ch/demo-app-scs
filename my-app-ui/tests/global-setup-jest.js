module.exports = async () => {
  process.env.TZ = "UTC"; // set the global timezone to UTC in order to simplify tests
};
