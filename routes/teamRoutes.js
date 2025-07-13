const express = require("express");
const router = express.Router();

const {
  addTeamMember,
  getAllTeamMembers,
  getAssignedChats,
  updateTeamMember,
  deleteTeamMember,
  updatePermissions,
  teamMemberLogin,
  getCurrentTeamMember,
} = require("../controllers/teamController");

// Standard REST routes
router.get("/", getAllTeamMembers);
router.post("/", addTeamMember);
router.get("/all-members", getAllTeamMembers);
router.post("/add-member", addTeamMember);
router.get("/:memberId/assigned-chats", getAssignedChats);
router.put("/update/:id", updateTeamMember);
router.put("/permissions/:id", updatePermissions);
router.post("/login", teamMemberLogin);
router.get("/current", getCurrentTeamMember);
router.delete("/:id", deleteTeamMember);

module.exports = router;
