import express from 'express';
import { ZoomMeetingModel } from '../models/ZoomMeeting';
import { ZoomCallRequestModel } from '../models/ZoomCallRequest';
import { isAuthenticated, isAdmin, isSuperadmin } from '../auth';
import axios from 'axios';

const router = express.Router();

// TODO: Replace with your actual Zoom JWT or OAuth token
const ZOOM_JWT = process.env.ZOOM_JWT || 'YOUR_ZOOM_JWT_TOKEN';
const ZOOM_USER_ID = process.env.ZOOM_USER_ID || 'YOUR_ZOOM_USER_ID';

// POST /api/zoom/schedule - Updated to handle scheduling from a request
router.post('/schedule', isAdmin, async (req, res) => {
  try {
    const { requestId, scheduledFor, duration } = req.body;

    if (!requestId || !scheduledFor || !duration) {
      return res.status(400).json({ error: 'Missing required fields for scheduling' });
    }

    // 1. Fetch the approved request
    const callRequest = await ZoomCallRequestModel.findById(requestId);
    if (!callRequest || callRequest.status !== 'approved') {
      return res.status(404).json({ error: 'Approved call request not found or not in correct state.' });
    }

    // Extract details for Zoom API
    const { topic, requesterId, requesterRole } = callRequest;
    const founderId = requesterRole === 'founder' ? requesterId.toString() : undefined;
    const investorId = requesterRole === 'investor' ? requesterId.toString() : undefined;

    // 2. Call Zoom API to create meeting
    const zoomRes = await axios.post(
      `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      {
        topic,
        type: 2, // Scheduled meeting
        start_time: scheduledFor,
        duration,
        timezone: 'UTC',
        settings: { join_before_host: true }
      },
      {
        headers: { Authorization: `Bearer ${ZOOM_JWT}` }
      }
    );
    const meeting = zoomRes.data;

    // 3. Save to DB using Mongoose model
    const zoomMeeting = await ZoomMeetingModel.create({
      topic,
      scheduledFor: new Date(scheduledFor),
      duration,
      createdBy: req.user!._id,
      founderId,
      investorId,
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      zoomMeetingId: meeting.id,
      zoomPassword: meeting.password,
      status: 'scheduled',
    });

    // 4. Update the original request
    callRequest.status = 'scheduled';
    callRequest.scheduledMeetingId = zoomMeeting._id;
    await callRequest.save();

    // 5. Emit real-time event
    req.app.get('io').to(founderId || investorId).emit('zoomMeetingScheduled', zoomMeeting);
    
    res.json({ success: true, meeting: zoomMeeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to schedule Zoom meeting' });
  }
});

// POST /api/zoom/request - Create a new Zoom call request (for founders/investors)
router.post('/request', isAuthenticated, async (req, res) => {
  try {
    const { topic, message, proposedDate } = req.body;
    const requesterId = req.user!._id;
    const requesterRole = req.user!.role; // 'founder' or 'investor'

    if (requesterRole !== 'founder' && requesterRole !== 'investor') {
      return res.status(403).json({ error: 'Only founders and investors can create zoom requests.' });
    }

    const newRequest = await ZoomCallRequestModel.create({
      requesterId,
      requesterRole,
      topic,
      message,
      proposedDate,
    });
    res.status(201).json({ success: true, request: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Zoom call request' });
  }
});

// GET /api/zoom/requests/my - Get all requests for the logged-in user
router.get('/requests/my', isAuthenticated, async (req, res) => {
  try {
    const requests = await ZoomCallRequestModel.find({ requesterId: req.user!._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your Zoom call requests' });
  }
});

// GET /api/zoom/requests/admin - Get all requests for admins
router.get('/requests/admin', isAdmin, async (req, res) => {
    try {
        const requests = await ZoomCallRequestModel.find()
            .populate('requesterId', 'username email') // Populate with user's name and email
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch Zoom call requests for admin' });
    }
});


// GET /api/zoom/requests/all - Get all requests for superadmins
router.get('/requests/all', isSuperadmin, async (req, res) => {
    try {
        const requests = await ZoomCallRequestModel.find()
            .populate('requesterId', 'username email')
            .populate('adminId', 'username')
            .sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch all Zoom call requests' });
    }
});


// PUT /api/zoom/requests/:id - Update a request's status (for admins)
router.put('/requests/:id', isAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const adminId = req.user!._id;
    const updatedRequest = await ZoomCallRequestModel.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, adminId },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }
    // TODO: Notify user of status change (e.g., via email or socket.io)

    res.json({ success: true, request: updatedRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update Zoom call request' });
  }
});

// GET /api/zoom/meetings - Get all scheduled meetings (for admins)
router.get('/meetings', isAdmin, async (req, res) => {
  try {
    const meetings = await ZoomMeetingModel.find()
      .populate('founderId', 'username email')
      .populate('investorId', 'username email')
      .sort({ scheduledFor: -1 });
    res.json({ success: true, meetings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch scheduled Zoom meetings' });
  }
});

export default router; 