// /api/load-portfolio.js
// This loads portfolios from your database

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // Example: Load from your database
    // const portfolio = await db.portfolios.findOne({ id });

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    return res.status(200).json(portfolio);
  } catch (error) {
    console.error('Load error:', error);
    return res.status(500).json({ error: 'Failed to load portfolio' });
  }
}
