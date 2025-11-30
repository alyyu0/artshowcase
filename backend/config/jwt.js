module.exports = {
  secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_for_development',
  expiresIn: '24h'
};