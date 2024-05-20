import useEncryption, { isValidUserId } from "../../hooks/useEncryption.ts";

const { id, peerId } = await useEncryption();
console.log(id.value, peerId.value);
console.log(isValidUserId(id.value));
