import { Game, GameDoc } from "./interfaces";

export const convertGame2Doc = (game: Game) => {
  return {
    name: game.name,
    steps: game.steps.map((step) => {
      return {
        name: step.name,
        description: step.description,
        show: false,
        doc: step.requirements.map((requirement) => {
          return { description: requirement, show: false };
        }),
      };
    }),
  };
};
