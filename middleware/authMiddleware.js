const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; 
            next(); 
            
        } catch (error) {
            console.error("Token Verification Failed:", error);
            return res.status(401).json({ success: false, message: "Not authorized, token failed!" });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, no token provided!" });
    }
};

// Role-Based Authorization Guard
const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user comes from the 'protect' middleware that runs right before this one
        if (!req.user || !roles.includes(req.user.role)) {
            // Status 403 means "Forbidden" - you are logged in, but not allowed here
            return res.status(403).json({ 
                success: false, 
                message: `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route.` 
            });
        }
        // Agar role match ho gaya (e.g., 'doctor'), tabhi aage jane do
        next();
    };
};



const User = require('../models/User'); // Import User model at the top

// Consent Guard
const requireConsent = async (req, res, next) => {
    try {
        // Find the user making the request
        const user = await User.findById(req.user.id);

        // If they haven't given consent, block them
        if (!user || user.consentGiven !== true) {
            return res.status(403).json({ 
                success: false, 
                message: "Consent required. Please agree to the terms and conditions before submitting data." 
            });
        }

        // Agar consent true hai, toh aage jane do!
        next();
    } catch (error) {
        console.error("Consent Check Error:", error);
        res.status(500).json({ success: false, message: "Server error verifying consent." });
    }
};

// Update your exports to include requireConsent
module.exports = { protect, authorize, requireConsent };


