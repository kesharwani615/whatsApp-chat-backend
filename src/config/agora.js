import pkg from "agora-access-token";

const { RtcTokenBuilder, RtcRole } = pkg;

export const generateToken = (loggedInUserId, channelName) => {
    const appID = process.env.APP_ID;
    const appCertificate = process.env.APP_CERTIFICATE;

    // const channelName = generateChannelName(loggedInUserId, receiverUserId);

    const uid = 0;

    console.log("uid", uid);
    console.log("channelName", channelName);
    console.log("appID", appID);
    console.log("appCertificate", appCertificate);

    const role = RtcRole.PUBLISHER;

    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
        appID,
        appCertificate,
        channelName,
        uid,
        role,
        privilegeExpireTime
    );

    return { token, channelName };
};