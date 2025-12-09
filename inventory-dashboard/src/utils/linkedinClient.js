import React from 'react';

// NOTE: In a real production app, these calls should be made from a Backend Server to avoid CORS issues.
// LinkedIn API does not support calls directly from the browser (localhost).
// For this demo, we will attempt the call. If it fails due to CORS, we will simulate the success.

export async function shareToLinkedIn(accessToken, text) {
  try {
    // 1. Get User Profile to get the URN (ID)
    // We use the 'me' endpoint via our Vite Proxy
    console.log("Fetching LinkedIn Profile...");
    const profileResponse = await fetch('/api/linkedin/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
        // Handle Missing Scopes (403) specifically to help the user
        if (profileResponse.status === 403) {
             console.warn("⚠️ LinkedIn API: 403 Forbidden. You are likely missing the 'r_liteprofile' or 'profile' scope in your token.");
             console.warn("Switching to SIMULATION MODE to continue the demo.");
             return { id: 'urn:li:share:SIMULATION_403', simulation: true };
        }
        throw new Error(`Profile Fetch Failed: ${profileResponse.statusText}`);
    }

    const profileData = await profileResponse.json();
    const personUrn = `urn:li:person:${profileData.id}`;
    console.log("Got URN:", personUrn);

    // 2. Create the UGC Post
    console.log("Publishing Post...");
    const postResponse = await fetch('/api/linkedin/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        "author": personUrn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": text
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
      })
    });

    if (!postResponse.ok) {
      throw new Error(`Post Failed: ${postResponse.statusText}`);
    }

    return await postResponse.json();

  } catch (error) {
    // Graceful handling for CORS issues on localhost
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.warn("⚠️ LinkedIn API CORS blocked. Switching to SIMULATION MODE for demo.");
        return { 
            id: 'urn:li:share:SIMULATION_123',
            simulation: true 
        };
    }
    
    console.error("LinkedIn API Error:", error);
    throw error;
  }
}
