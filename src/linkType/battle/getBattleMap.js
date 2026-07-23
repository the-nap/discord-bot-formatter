import sharp from "sharp";
import { AttachmentBuilder } from "discord.js";
import { renderBattleMap } from "#utils/renderBattleMap.js";

export async function getBattleMap(battle) {

    let svg;

    if (battle.type === "war") {
        svg = renderBattleMap([
            battle.defender.region,
            battle.attacker.region
        ]);
    }

    if (battle.type === "resistance") {
        svg = renderBattleMap([
            battle.defender.region
        ]);
    }

    if (!svg)
        return null;

    const png = await sharp(Buffer.from(svg, "utf8"))
        .png()
        .toBuffer();

    return new AttachmentBuilder(
        png,
        { name: "region.png" }
    );
}
