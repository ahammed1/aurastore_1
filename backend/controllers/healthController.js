const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'AuraStore REST Engine',
  });
};

module.exports = { getHealth };
