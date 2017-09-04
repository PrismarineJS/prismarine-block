
describe('1.12.1 - Block', () => {
  let Block

  beforeAll(() => {
    Block = require('./block')('1.12.1')
  })

  it('returns similar blocks when invoked with the same block id', () => {
    let b1 = new Block(1, 0)
    let b2 = new Block(1, 0)
    expect(b1).toEqual(b2)
    expect(b1).not.toBe(b2)
  })

  it('returns correct display name for blocks without variations', () => {
    let b = new Block(1, 0, 0)
    expect(b.name).toEqual('stone')
    expect(b.displayName).toEqual('Stone')
  })

  it('returns correct display name for blocks with valid variation', () => {
    let b = new Block(255, 0, 2)
    expect(b.name).toEqual('structure_block')
    expect(b.displayName).toEqual('Corner')
  })

  it('returns correct display name for blocks with valid invalid variation', () => {
    let b = new Block(255, 0, 5)
    expect(b.name).toEqual('structure_block')
    expect(b.displayName).toEqual('Structure Block')
  })
})
