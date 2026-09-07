// AsciiArt — baked output from the 21st.dev ASCII editor: one looping video
// plus a poster per recipe, filling whatever parent it is dropped into.
// Remix a recipe (styles, animation, palette) in the editor:
// https://21st.dev/community/ascii/editor
type AsciiRecipe = {
  label: string;
  poster: string;
  src: string;
};

export const ASCII_D60_HERO: AsciiRecipe = {
  label: 'D60-hero — animated ASCII art',
  poster: 'https://assets.21st.dev/ascii-recipes/thumbnails/user_3GYHFar2zrRr79sK3wSzHGVOC0I/eb38ebaf-a2ac-432d-bf49-2fc832ae9eeb.png',
  src: 'https://assets.21st.dev/ascii-recipes/videos/user_3GYHFar2zrRr79sK3wSzHGVOC0I/4b89c015-6b11-4816-b442-b125da0c8091.mp4',
};

export const ASCII_LOG_LEET: AsciiRecipe = {
  label: 'ASCII log leet — animated ASCII art',
  poster: 'https://assets.21st.dev/ascii-recipes/thumbnails/user_35NAal4ngoiwl586UuIyinZjTsG/b732d510-cc6f-4404-b9a4-04109f4e3c5a.webp',
  src: 'https://assets.21st.dev/ascii-recipes/videos/user_35NAal4ngoiwl586UuIyinZjTsG/bcd90453-febb-4757-a2fd-387fcdd0b17a.mp4',
};

/* Holding on the poster is how a looping background honours reduced motion;
   there is no CSS way to pause a video. */
const prefersStill = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

type AsciiArtProps = {
  className?: string;
  recipe: AsciiRecipe;
};

export function AsciiArt({ className, recipe }: AsciiArtProps) {
  return <video className={className} src={recipe.src} poster={recipe.poster} autoPlay={!prefersStill()} loop muted playsInline aria-label={recipe.label} style={{ display: 'block', height: '100%', objectFit: 'cover', width: '100%' }} />;
}
