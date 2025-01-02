const express = require('express');
const router = express.Router();

router.post('/wp-json/church-mobile/v1/onboarding', async (req, res) => {
  try {
    const {
      // Personal Info
      firstName, lastName, christianName, gender, 
      maritalStatus, educationLevel, occupation,
      // Contact Info
      phoneNumber, residencyCity, residenceAddress, emergencyContact,
      // Church Info
      christianLife, serviceAtParish, ministryService,
      hasFatherConfessor, fatherConfessorName,
      hasAssociationMembership, associationName,
      // Children Info
      hasChildren, numberOfChildren, children
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !residencyCity || !residenceAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields are missing' 
      });
    }

    // Add after existing validation
    if (hasChildren === 'yes') {
      if (!Array.isArray(children)) {
        return res.status(400).json({
          success: false,
          message: 'Children data must be an array'
        });
      }
      if (children.length !== parseInt(numberOfChildren)) {
        return res.status(400).json({
          success: false,
          message: 'Number of children does not match children data'
        });
      }
      // Validate each child's required fields
      const invalidChild = children.find(child => 
        !child.fullName || !child.christianityName || !child.gender
      );
      if (invalidChild) {
        return res.status(400).json({
          success: false,
          message: 'Each child must have fullName, christianityName, and gender'
        });
      }
    }

    // Start transaction
    const trx = await db.transaction();

    try {
      // Update user profile
      const updatedUser = await trx('users')
        .where({ id: req.user.id })
        .update({
          first_name: firstName,
          last_name: lastName,
          christian_name: christianName,
          gender,
          marital_status: maritalStatus,
          education_level: educationLevel,
          occupation,
          phone_number: phoneNumber,
          residency_city: residencyCity,
          residence_address: residenceAddress,
          emergency_contact: emergencyContact,
          christian_life: christianLife,
          service_at_parish: serviceAtParish,
          ministry_service: ministryService,
          has_father_confessor: hasFatherConfessor,
          father_confessor_name: fatherConfessorName,
          has_association_membership: hasAssociationMembership,
          association_name: associationName,
          has_children: hasChildren,
          number_of_children: numberOfChildren,
          is_onboarding_complete: true
        })
        .returning('*');

      // Handle children if present
      if (hasChildren === 'yes' && Array.isArray(children)) {
        await trx('user_children')
          .where({ user_id: req.user.id })
          .delete(); // Remove existing children

        await Promise.all(children.map(child => 
          trx('user_children').insert({
            user_id: req.user.id,
            full_name: child.fullName,
            christianity_name: child.christianityName,
            gender: child.gender
          })
        ));
      }

      await trx.commit();
      res.json({ 
        success: true, 
        user: {
          ...updatedUser[0],
          children: hasChildren === 'yes' ? children : []
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.code === 'ER_DUP_ENTRY' 
        ? 'Duplicate entry found'
        : 'Failed to complete onboarding',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
