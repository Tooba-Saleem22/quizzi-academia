const Users = require('../models/userSchema')

const adminCtrl = {
    getAllUsers: async (req, res) => {
        try {
            if(req.user.role !== 1) {
                return res.status(403).json({msg: "Admin access denied"})
            }
            
            const users = await Users.find().select('-password')
            
            res.json(users)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
    getUserById: async (req, res) => {
        try {
            if(req.user.role !== 1) {
                return res.status(403).json({msg: "Admin access denied"})
            }
            
            const user = await Users.findById(req.params.id).select('-password')
            if(!user) return res.status(404).json({msg: "User not found"})
            
            res.json(user)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
    updateUser: async (req, res) => {
        try {
            if(req.user.role !== 1) {
                return res.status(403).json({msg: "Admin access denied"})
            }
            
            const {name, email, role} = req.body
            
            await Users.findByIdAndUpdate(req.params.id, {
                name, email, role
            })
            
            res.json({msg: "User updated successfully"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
    deleteUser: async (req, res) => {
        try {
            if(req.user.role !== 1) {
                return res.status(403).json({msg: "Admin access denied"})
            }
            
            await Users.findByIdAndDelete(req.params.id)
            
            res.json({msg: "User deleted successfully"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

module.exports = adminCtrl