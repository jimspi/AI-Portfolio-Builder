// /api/save-portfolio.js
// This saves portfolios to your database

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const portfolioData = req.body;

  try {
    // Example: Save to your database (MongoDB, PostgreSQL, etc.)
    // await db.portfolios.upsert({
    //   id: portfolioData.id,
    //   data: portfolioData,
    //   updatedAt: portfolioData.updatedAt
    // });

    return res.status(200).json({ 
      success: true,
      id: portfolioData.id 
    });
  } catch (error) {
    console.error('Save error:', error);
    return res.status(500).json({ error: 'Failed to save portfolio' });
  }
}
