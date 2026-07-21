import { describe, expect, it, vi } from "vitest";
import { getEquipFormatted, parseEquipment } from "../../util/equipMaker";
import Canvas from "@napi-rs/canvas";

const loadImage = vi.spyOn(Canvas, "loadImage")
  .mockImplementation(async () => {
    return Canvas.createCanvas(256, 256);
  });


describe('getEquipFormatted', () => {
  it('returns a png buffer', async () => {

    const equipment = {};
    const result = await getEquipFormatted(equipment);
    expect(result).toBeInstanceOf(Buffer);
  });
  
  it('returns correctly for full armor', async () => {
    const equipment =
      {
        weapon:{code:"rifle"},
        ammo:"ammo",
        helmet:{code:"helmet3"},
        chest:{code:"chest2"},
        gloves:{code:"gloves1"},
        pants:{code:"pants2"},
        boots:{code:"boots1"}        
      }

    const result = await getEquipFormatted(equipment);
    expect(loadImage).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Buffer);
  });

  it('returns correctly for partial armor', async () => {
    const equipment =
      {
        weapon:{code:"rifle"},
        ammo: undefined,
        chest:{code:"chest2"},
        pants:{code:"pants2"},
        boots: null,
      }

    const result = await getEquipFormatted(equipment);
    expect(loadImage).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Buffer);
  });
});

describe('parseEquipment', () => {
  it('returns null for empty input', () => {
    expect(parseEquipment(null)).toBeNull();
  });

  it('parses predefined equipment', () => {
    expect(parseEquipment("rifle"))
    .toEqual({
      name: 'rifle',
      tier: 2,
    })
  });

  it('parses equipment with tier', () => {
    expect(parseEquipment('pants4'))
    .toEqual({
      name: 'pants',
      tier: 3,
    });
  });
});

