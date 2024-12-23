const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const onboardingData = req.body;

  // Access children's information if provided
  const children = onboardingData.children;

  if (onboardingData.hasChildren === 'yes' && (!children || !Array.isArray(children))) {
    return res.status(400).json({ error: "Children's information is required when hasChildren is 'yes'." });
  }

  if (Array.isArray(children)) {
    children.forEach(child => {
      // Validate child data (e.g., check for required fields)
      if (!child.fullName || !child.christianityName || !child.gender) {
        return res.status(400).json({ error: "All children's information fields are required." });
      }
    });
  }

  // Process the onboarding data, including children's information
  console.log("Received onboarding ", onboardingData);

  // ... your existing logic to save the onboarding data ...

  res.status(200).json({ message: 'Onboarding data received successfully' });
});

module.exports = router;
