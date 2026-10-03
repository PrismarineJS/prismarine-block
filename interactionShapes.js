module.exports = function (registry) {
  const data = registry.version.type === 'pc' ? registry.blockSelectionShapes : null
  if (!data) return block => block.shapes

  const namesById = data.blockIds && Object.fromEntries(Object.entries(data.blockIds).map(([name, id]) => [id, name]))
  const metadataIndices = {}
  for (const [name, metadata] of Object.entries(data.stateMetadata || {})) {
    const indices = {}
    for (let index = 0; index < metadata.length; index++) (indices[metadata[index]] ??= []).push(index)
    metadataIndices[name] = indices
  }

  return block => {
    if (!block.name) return block.shapes
    const name = namesById ? namesById[block.type] : block.name
    const reference = data.blocks[name]
    if (reference === undefined) return block.shapes
    let index = block.metadata
    if (data.stateMetadata) {
      // Legacy base properties are shared; merge computed context into a copy.
      const properties = { ...block._properties, ...block.computedStates }
      const candidates = (metadataIndices[name]?.[block.metadata] || []).filter(index => {
        const native = data.stateProperties[name][index]
        return Object.entries(properties).every(([key, value]) => !Object.hasOwn(native, key) || native[key] === String(value))
      })
      if (!candidates.length) return block.shapes
      index = candidates[0]
      const shapeAt = index => Array.isArray(reference) ? reference[index] : reference
      // Different neighbor-derived states may share metadata. Without enough
      // properties to distinguish their shapes, retain collision behavior.
      if (candidates.some(candidate => shapeAt(candidate) !== shapeAt(index) || JSON.stringify(data.offsets?.[name]?.[candidate]) !== JSON.stringify(data.offsets?.[name]?.[index]))) return block.shapes
    }
    const shapeId = Array.isArray(reference) ? reference[index] : reference
    if (shapeId === undefined) return block.shapes
    const boxes = data.shapes[shapeId]
    if (!boxes) return block.shapes
    const offset = data.offsets?.[name]?.[index]
    if (!offset) return boxes
    if (!['model', 'legacyModel'].includes(offset.type)) return block.shapes
    const shift = modelOffset(block.position, offset)
    return boxes.map(box => box.map((value, axis) => value + shift[axis % 3]))
  }
}

function modelOffset (position, descriptor) {
  const x = Math.floor(position?.x ?? 0)
  const z = Math.floor(position?.z ?? 0)
  let seed = BigInt(Math.imul(x, 3129871)) ^ (BigInt(z) * 116129781n)
  seed = BigInt.asIntN(64, seed * seed * 42317861n + seed * 11n) >> 16n
  const fraction = shift => Math.fround(Number((seed >> shift) & 15n) / 15)
  const clamp = value => Math.max(-descriptor.maxHorizontal, Math.min(descriptor.maxHorizontal, value))
  // Older Java versions multiply the vertical offset as a double, newer ones
  // use float arithmetic. Keep both overflow and rounding identical to Java.
  const y = descriptor.type === 'legacyModel' ? (fraction(4n) - 1) * descriptor.verticalMultiplier : Math.fround(Math.fround(fraction(4n) - 1) * descriptor.verticalMultiplier)
  return [clamp((fraction(0n) - 0.5) * 0.5), y, clamp((fraction(8n) - 0.5) * 0.5)]
}
