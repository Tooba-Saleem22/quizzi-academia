
const checkQuizAccess = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const record = await PaidUser.findOne({ email }).sort({ date: -1 });

    if (!record || new Date() > new Date(record.accessExpires)) {
      return res.status(403).json({ error: 'Access expired. Please pay again.' });
    }

    next();
  } catch (err) {
    console.error('Access check failed:', err);
    return res.status(500).json({ error: 'Server error during access check' });
  }
};

module.exports = checkQuizAccess;
