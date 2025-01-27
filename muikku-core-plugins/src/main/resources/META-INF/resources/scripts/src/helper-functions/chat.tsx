import mApi from "~/lib/mApi";
import promisify from "~/util/promisify";
import { IChatContact } from "~/components/chat/chat";

/**
 * obtainNick gets user nick (and name, if present) based on jid
 * @param jId chat id
 * @returns user of type IChatContact
 */
export const obtainNick = async (jId: string) => {
  const user: IChatContact = (await promisify(
    mApi().chat.userInfo.read(jId.split("@")[0], {}),
    "callback"
  )()) as IChatContact;

  return user;
};

/**
 * getUserChatId gets user chat ID
 * @param userId string version of user Id
 * @param type staff or student ID
 * @returns chat Jid
 */
export const getUserChatId = (userId: number, type: "staff" | "student") => {
  let muikkuChatIdBeginning = "";

  if (type === "staff") {
    muikkuChatIdBeginning = "muikku-staff-";
  } else {
    muikkuChatIdBeginning = "muikku-student-";
  }

  const chatHostName = window.sessionStorage.getItem("strophe-bosh-hostname");

  if (chatHostName !== null) {
    return muikkuChatIdBeginning + userId + "@" + chatHostName;
  }
};

/**
 * subscribeToUser adds user to roster ( subscribes and is subscribed()
 * @param toJId stanza recipient JId
 * @param connection strophe connection
 * @param type subscription type
 */
export const handleSubscription = (
  toJId: string,
  connection: Strophe.Connection,
  type: "subscribe" | "subscribed" | "unsubscribe" | "unsubscribed"
) => {
  const subscribe = $pres({
    from: connection.jid,
    to: toJId,
    type: type,
  });
  connection.send(subscribe);
};

/**
 * handleRosterDelete manipulates roster
 * @param toJId stanza recipient JId
 * @param connection strophe connection
 * @returns an answer stanza element
 */
export const handleRosterDelete = async (
  toJId: string,
  connection: Strophe.Connection
): Promise<Element> => {
  const stanza = $iq({
    from: connection.jid,
    type: "set",
  })
    .c("query", { xmlns: Strophe.NS.ROSTER })
    .c("item", { jid: toJId, subscription: "remove" });

  const answer: Element = await new Promise((resolve) =>
    connection.sendIQ(stanza, (answerStanza: Element) => resolve(answerStanza))
  );

  return answer;
};

/**
 *
 * @param groupName group to add user tp
 * @param fromJId stanza sender JId
 * @param toJId stanza recipient JId
 * @param connection strophe connection
 * @returns
 */
export const setUserToRosterGroup = async (
  groupName: string,
  toJId: string,
  connection: Strophe.Connection
): Promise<Element> => {
  const stanza = $iq({
    from: connection.jid,
    type: "set",
  })
    .c("query", { xmlns: Strophe.NS.ROSTER })
    .c("item", { jid: toJId })
    .c("group", groupName);

  const answer: Element = await new Promise((resolve) =>
    connection.sendIQ(stanza, (answerStanza: Element) => resolve(answerStanza))
  );

  return answer;
};

/**
 * requestPrescense
 * @param toJId stanza recipient
 * @param connection strophe connection
 */
export const requestPrescense = (
  toJId: string,
  connection: Strophe.Connection
) => {
  connection.send(
    $pres({
      from: connection.jid,
      to: toJId,
      type: "probe",
    })
  );
};
