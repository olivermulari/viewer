const isProd = process.env.NODE_ENV === 'production'
module.exports = (phase, { defaultConfig }) => {
  defaultConfig.basePath = isProd ? '/viewer' : ""
  return defaultConfig
};
