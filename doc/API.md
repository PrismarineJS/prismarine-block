## Block entities

Some blocks may have entity data attached to them. If they do, they contain extra fields which can manipulate the entity NBT data

### sign

#### .blockEntity

Returns 4 fields with .Text1, .Text2, .Text3, .Text4 each containing instances of prismarine-chat ChatMessage, if a block entity exists for the sign.

#### get .signText

Returns a plaintext string containing the sign's text

#### set .signText

Sets the text for a sign's text, can be plaintext, or array of JSON or prismarine-chat instances
