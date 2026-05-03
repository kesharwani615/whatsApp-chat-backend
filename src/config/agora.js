import pkg from "agora-access-token";

const { RtcTokenBuilder, RtcRole } = pkg;

export const generateToken = (loggedInUserId, channelName) => {
    const appID = process.env.APP_ID;
    const appCertificate = process.env.APP_CERTIFICATE;

    // const channelName = generateChannelName(loggedInUserId, receiverUserId);

    const uid = Number(loggedInUserId);

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