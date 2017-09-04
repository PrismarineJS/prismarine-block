
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

  it('returns a block with expected properties and methods', () => {
    let b = new Block(1)
    expect(b.name).toEqual('stone')
    expect(b.displayName).toEqual('Stone')
    console.log(b)
  })
})
