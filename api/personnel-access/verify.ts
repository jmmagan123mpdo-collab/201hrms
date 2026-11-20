export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ authorized: false, error: 'Method not allowed.' });
  const configuredKey = process.env.PERSONNEL_ACCESS_KEY;
  if (!configuredKey) return res.status(503).json({ authorized: false, error: 'Personnel access is not configured by the system administrator yet.' });
  const submittedKey = typeof req.body?.accessKey === 'string' ? req.body.accessKey : '';
  if (!submittedKey || submittedKey.length > 256 || submittedKey !== configuredKey) {
    return res.status(401).json({ authorized: false, error: 'Invalid personnel access key.' });
  }
  return res.status(200).json({ authorized: true });
}
