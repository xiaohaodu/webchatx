import { getPeerIdFromUserId, generateAndSetIdentifier } from "@/utils";
import { PeerId } from "@libp2p/interface";
import { peerIdFromString } from "@libp2p/peer-id";
export default class ChatUser implements ChatUserInfo {
  constructor(
    id: string,
    userId: string,
    peerId: PeerId,
    name: string,
    messagesId: string,
    friendIds: string[],
    channelIds: string[],
    relayMultiaddrs: string[],
    description: string,
    unique?: string
  ) {
    this.name = name;
    this.id = id;
    this.userId = userId;
    this.peerId = peerId;
    this.messagesId = messagesId;
    this.description = description;
    this.friendIds = [...friendIds];
    this.channelIds = [...channelIds];
    this.relayMultiaddrs = [...relayMultiaddrs];
    this.stunTurn = [];
    this.avatar =
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNzEzMTgwNzU5OTUxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEzMTggMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE1NDAiIHdpZHRoPSIyMC41OTM3NSIgaGVpZ2h0PSIxNiIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik0xMzE4LjUwMjQ4OSA0MzIuNzc5MDUyYzAtMjMxLjc5MDUyMi0yMDkuMjk4NDItNDE5LjcwNDgyNi00NjcuNDU4OTkyLTQxOS43MDQ4MjZzLTQ2Ny41Njk3OSAxODguMzU3NDk4LTQ2Ny41Njk3OSA0MTkuNzA0ODI2IDIwOS40MDkyMTkgNDE5LjcwNDgyNiA0NjcuNTY5NzkgNDE5LjcwNDgyNmE1MTIuMTEwNzk5IDUxMi4xMTA3OTkgMCAwIDAgMTgzLjQ4MjM2My0zMy4yMzk1NTlsOTMuMjkyMzYxIDkzLjI5MjM2MWEyNS44MTYwNTcgMjUuODE2MDU3IDAgMCAwIDQ0LjMxOTQxMi0xOS4xNjgxNDVMMTE2NS44MjIxMTYgNzQyLjM1MDE0MUMxMjU5LjMzNjA3NCA2NjUuNTY2NzYgMTMxOC41MDI0ODkgNTU1LjQzMzAyMyAxMzE4LjUwMjQ4OSA0MzIuNzc5MDUyeiIgZmlsbD0iIzYxMjI3MyIgcC1pZD0iMTU0MSI+PC9wYXRoPjxwYXRoIGQ9Ik0xMDM0LjMwNDI2MyA3NDUuNzg0ODk1YTUwOS42NzMyMzEgNTA5LjY3MzIzMSAwIDAgMS0xODMuNDgyMzYzIDMzLjIzOTU1OWMtMjQ0LjUzMjM1MiAwLTQ0NS4wNzc2ODktMTY4LjUyNDU2Mi00NjUuMzUzODE5LTM4My4yNTIxMS0xLjEwNzk4NSAxMi4wNzcwNC0xLjg4MzU3NSAyNC4yNjQ4NzgtMS44ODM1NzUgMzYuNTYzNTE0IDAgMjMxLjc5MDUyMiAyMDkuNDA5MjE5IDQxOS43MDQ4MjYgNDY3LjU2OTc5IDQxOS43MDQ4MjZhNTEyLjExMDc5OSA1MTIuMTEwNzk5IDAgMCAwIDE4My40ODIzNjMtMzMuMjM5NTU5bDkzLjI5MjM2MSA5My4yOTIzNjFhMjUuODE2MDU3IDI1LjgxNjA1NyAwIDAgMCA0NC4zMTk0MTEtMTkuMTY4MTQ1IDI1LjI2MjA2NCAyNS4yNjIwNjQgMCAwIDAtNy41MzQzLTE3LjI4NDU3MXpNMTE2NS44MjIxMTYgNjY5LjIyMzExMmwyLjc2OTk2NCA3MC42ODk0NjFDMTI2MC40NDQwNiA2NjMuMjM5OTkxIDEzMTguNTAyNDg5IDU1My45OTI2NDIgMTMxOC41MDI0ODkgNDMyLjc3OTA1MmEzNjYuNjMyMzMxIDM2Ni42MzIzMzEgMCAwIDAtMS44ODM1NzUtMzYuNzg1MTExIDQwMy45NzE0MzUgNDAzLjk3MTQzNSAwIDAgMS0xNTAuNzk2Nzk4IDI3My4yMjkxNzF6IiBmaWxsPSIjNjEyMjczIiBvcGFjaXR5PSIuMiIgcC1pZD0iMTU0MiI+PC9wYXRoPjxwYXRoIGQ9Ik0zODMuMjUyMTEgNDMyLjc3OTA1MmEzODMuMTQxMzExIDM4My4xNDEzMTEgMCAwIDEgNDEuODgxODQ0LTE3Mi45NTY1MDNjLTEyLjI5ODYzNy0wLjk5NzE4Ny0yNC44MTg4Ny0xLjY2MTk3OC0zNy40NDk5MDMtMS42NjE5NzhDMTczLjUxMDQ5NiAyNTguMTYwNTcxIDAgNDEzLjk0MzMwMiAwIDYwNi4xNzg3NDljMCAxMDEuNzEzMDQ5IDQ4Ljk3Mjk1IDE5My4wMTEwMzcgMTI2LjQyMTEyMSAyNTYuNjA5MzkybC01Ljc2MTUyNCAxNDguNDcwMDI4YTEyLjE4NzgzOCAxMi4xODc4MzggMCAwIDAgMjAuODMwMTI0IDkuMDg1NDhsOTQuMDY3OTUtOTMuOTU3MTUzQTQyNS41NzcxNDggNDI1LjU3NzE0OCAwIDAgMCAzODcuNzk0ODUgOTU0LjE5NjkyN2E0MDQuNjM2MjI2IDQwNC42MzYyMjYgMCAwIDAgMzAwLjM3NDgxLTEyOC4zMDQ2OTZjLTE3Ny44MzE2MzgtNTkuMzg4MDExLTMwNC45MTc1NS0yMTIuNzMzMTc1LTMwNC45MTc1NS0zOTMuMTEzMTc5eiIgZmlsbD0iI0VCM0Q3MiIgcC1pZD0iMTU0MyI+PC9wYXRoPjxwYXRoIGQ9Ik0zNDIuMjU2NjU0IDM5MS42NzI3OThjMCAxMTcuNTU3MjM5IDUzLjk1ODg4MyAyMjMuNTkxNDMgMTQwLjcxNDEzMiAyOTkuNzEwMDJhMzkxLjAwODAwNyAzOTEuMDA4MDA3IDAgMCAxLTk5LjcxODY3Ni0yNTguNjAzNzY2IDM4My4xNDEzMTEgMzgzLjE0MTMxMSAwIDAgMSA0MS44ODE4NDQtMTcyLjk1NjUwM2MtMTIuMjk4NjM3LTAuOTk3MTg3LTI0LjgxODg3LTEuNjYxOTc4LTM3LjQ0OTkwMy0xLjY2MTk3OC03LjA5MTEwNiAwLTE0LjA3MTQxMyAwLTIxLjA1MTcyIDAuNTUzOTkzYTM3NS45Mzk0MDcgMzc1LjkzOTQwNyAwIDAgMC0yNC4zNzU2NzcgMTMyLjk1ODIzNHpNNjMwLjExMTIzMSA4MDIuMTgxMzQ2YTQwNy42Mjc3ODYgNDA3LjYyNzc4NiAwIDAgMS0yODMuNTMzNDM0IDExMC43OTg1MjggNDI0LjEzNjc2NyA0MjQuMTM2NzY3IDAgMCAxLTE1Mi4xMjYzOC0yNy42OTk2MzJsLTcxLjY4NjY0NyA3MS42ODY2NDgtMi4xMDUxNzMgNTQuMjkxMjc5YTEyLjE4NzgzOCAxMi4xODc4MzggMCAwIDAgMjAuODMwMTI0IDkuMDg1NDhsOTQuMDY3OTUtOTMuOTU3MTUzQTQyNS41NzcxNDggNDI1LjU3NzE0OCAwIDAgMCAzODcuNzk0ODUgOTU0LjE5NjkyN2E0MDQuNjM2MjI2IDQwNC42MzYyMjYgMCAwIDAgMzAwLjM3NDgxLTEyOC4zMDQ2OTYgNDg2LjI5NDc0MSA0ODYuMjk0NzQxIDAgMCAxLTU4LjA1ODQyOS0yMy43MTA4ODV6TTg1LjQyNTY2NSA4MjEuNzkyNjg2bC01Ljc2MTUyMy00Ljk4NTkzNGMxLjg4MzU3NSAyLjIxNTk3MSAzLjY1NjM1MSA0LjQzMTk0MSA1LjY1MDcyNSA2LjY0NzkxMXoiIGZpbGw9IiNFQjNENzIiIG9wYWNpdHk9Ii41IiBwLWlkPSIxNTQ0Ij48L3BhdGg+PHBhdGggZD0iTTgzMy40MjY1MzEgMzMyLjM5NTU4NWM2NC4yNjMxNDctMTAuMTkzNDY1IDY0LjA0MTU0OS02Ni40NzkxMTcgNjIuNjAxMTY5LTc1LjM0Mjk5OXMtMTUuNDAwOTk1LTU0LjI5MTI3OS01OS45NDIwMDQtNDcuMjAwMTczUzc5OS4wNzg5ODcgMjU0LjgzNjYxNSA3OTkuMDc4OTg3IDI1NC44MzY2MTVhMjguNDc1MjIyIDI4LjQ3NTIyMiAwIDEgMCA1Ni4xNzQ4NTQtOC45NzQ2OHM2LjMxNTUxNiAzLjMyMzk1NiA4LjMwOTg5IDIwLjI3NjEzLTExLjk2NjI0MSAyOS4wMjkyMTQtMzUuNDU1NTI5IDMzLjIzOTU1OS04OC42Mzg4MjMtMTkuOTQzNzM1LTEwNC4wMzk4MTktMTE1LjQ1MjA2N0M3MDkuMTEwNTgyIDk2LjM5NDcyIDc4MS41NzI4MiAyOC4yNTM2MjUgODM4Ljk2NjQ1NyAxMy4xODUwMjVhNTUuMzk5MjY0IDU1LjM5OTI2NCAwIDAgMC02NC4wNDE1NDktNS4zMTgzMjljLTU2LjA2NDA1NSAzNS4xMjMxMzQtOTcuMTcwMzA5IDEwOS41Nzk3NDUtODUuNTM2NDY0IDE4Mi44MTc1NzEgMTQuOTU3ODAxIDkzLjg0NjM1NCA3OS42NjQxNDIgMTUxLjkwNDc4MyAxNDQuMDM4MDg3IDE0MS43MTEzMTh6TTIwMy45ODAwOTEgNTczLjgyNTU3OWE1My4wNzI0OTUgNTMuMDcyNDk1IDAgMCAwIDMzLjkwNDM1LTY3LjkxOTQ5OGMtMi42NTkxNjUtNi41MzcxMTMtMjEuMTYyNTE5LTM4LjIyNTQ5Mi01My41MTU2OS0yNS4wNDA0NjdhMzAuMDI2NDAxIDMwLjAyNjQwMSAwIDAgMC0xOS44MzI5MzYgNDAuNzczODU4IDIyLjE1OTcwNiAyMi4xNTk3MDYgMCAxIDAgNDAuNzczODU4LTE2LjYxOTc3OXM1LjMxODMyOSAxLjMyOTU4MiA5Ljg2MTA2OSAxMy43MzkwMTctMy45ODg3NDcgMjQuMDQzMjgxLTIxLjA1MTcyIDMxLjAyMzU4OC03MC4wMjQ2NyAwLjU1Mzk5My05OC44MzIyODgtNjguNjk1MDg3QzY4LjkxNjY4NSA0MTcuNTk5NjU0IDExMC43OTg1MjggMzUzLjU1ODEwNCAxNTEuOTA0NzgzIDMzMi4zOTU1ODVhNDIuODc5MDMxIDQyLjg3OTAzMSAwIDAgMC00OC45NzI5NSA3LjQyMzUwMiAxNDYuOTE4ODQ5IDE0Ni45MTg4NDkgMCAwIDAtMzIuNTc0NzY3IDE1Mi40NTg3NzVjMjcuODEwNDMxIDY4LjE0MTA5NSA4Ni44NjYwNDYgMTAwLjYwNTA2NCAxMzMuNjIzMDI1IDgxLjU0NzcxN3oiIGZpbGw9IiNGRUQxNTAiIHAtaWQ9IjE1NDUiPjwvcGF0aD48L3N2Zz4=";
    this.email = "";
    this.phone = "";
    this.location = "";
    this.role = "";
    this.unique = unique || "currentUser";
    this.isOnline = false;
  }
  userId: string;
  isOnline: boolean;
  id: string;
  peerId: PeerId;
  description: string;
  unique: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  relayMultiaddrs: string[];
  stunTurn: string[];
  friendIds: string[];
  channelIds: string[];
  messagesId: string;
  static async create(
    name: string,
    description: string,
    friendIds: string[],
    channelIds: string[],
    relayMultiaddrs: string[],
    messagesId: string,
    unique?: string,
    userId?: string,
    peerIdString?: string
  ) {
    let chatUser: ChatUser;
    if (userId) {
      const peerId = peerIdFromString(getPeerIdFromUserId(userId));
      chatUser = new ChatUser(
        peerId.toString(),
        userId,
        peerId,
        name,
        messagesId,
        friendIds,
        channelIds,
        relayMultiaddrs,
        description,
        unique
      );
    } else {
      const { id, peerId } = await generateAndSetIdentifier(peerIdString);
      chatUser = new ChatUser(
        peerId.toString(),
        id,
        peerId,
        name,
        messagesId,
        friendIds,
        channelIds,
        relayMultiaddrs,
        description,
        unique
      );
    }
    return chatUser;
  }
}
