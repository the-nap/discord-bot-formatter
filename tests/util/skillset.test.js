import { describe, it, expect } from "vitest";
import { isInWar } from "../../util/skillset";

describe('isInWar', () => {
  it('should be in war', () => {
    const skills = {
      attack: {
        level: 6
      },
      precision: {
        level: 4
      },
      energy: {
        level: 0
      },
      production: {
        level: 0
      }
    };

    expect(isInWar(skills)).toBeTruthy();
  });

  it('should be in eco', () => {
    const skills = {
      attack: {
        level: 0
      },
      precision: {
        level: 0
      },
      energy: {
        level: 4
      },
      production: {
        level: 5
      }
    };

    expect(isInWar(skills)).toBeFalsy();
  });
});
