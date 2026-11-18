export const googleFonts = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Source Sans 3', 'Raleway', 'PT Sans', 'Roboto Condensed', 'Roboto Mono',
  'Noto Sans', 'Ubuntu', 'Poppins', 'Merriweather', 'Playfair Display', 'Nunito', 'Rubik', 'Inter', 'Work Sans', 'Mukta',
  'Fira Sans', 'Quicksand', 'Barlow', 'Karla', 'Josefin Sans', 'Libre Baskerville', 'Inconsolata', 'Cabin', 'Bebas Neue', 'Anton',
  'Dancing Script', 'Pacifico', 'Lobster', 'Comfortaa', 'Archivo', 'Titillium Web', 'Heebo', 'DM Sans', 'Manrope', 'Space Grotesk',
  'Crimson Text', 'Arimo', 'Hind', 'IBM Plex Sans', 'IBM Plex Mono', 'IBM Plex Serif', 'Bitter', 'Exo 2', 'Cormorant Garamond', 'EB Garamond',
  'Lora', 'Libre Franklin', 'Assistant', 'Oxygen', 'Dosis', 'Abel', 'Signika', 'Maven Pro', 'Catamaran', 'Teko',
  'Varela Round', 'Yanone Kaffeesatz', 'Fjalla One', 'Asap', 'Zilla Slab', 'Arvo', 'Slabo 27px', 'Acme', 'Alegreya', 'Amatic SC',
  'Architects Daughter', 'Caveat', 'Indie Flower', 'Shadows Into Light', 'Permanent Marker', 'Satisfy', 'Great Vibes', 'Courgette', 'Righteous', 'Orbitron',
  'Press Start 2P', 'VT323', 'Special Elite', 'Abril Fatface', 'Alfa Slab One', 'Bangers', 'Fredoka', 'Baloo 2', 'Kalam', 'Gloria Hallelujah',
  'Rock Salt', 'Chakra Petch', 'Syne', 'Outfit', 'Plus Jakarta Sans', 'Lexend', 'Sora', 'Urbanist', 'Jost', 'Cinzel', 'Spectral'
]

export const googleSet = new Set(googleFonts)

const fam = name => 'family=' + name.replace(/ /g, '+')

export function googleUrl(name) {
  return 'https://fonts.googleapis.com/css2?' + fam(name) + '&display=swap'
}

export const googleAll = 'https://fonts.googleapis.com/css2?' + googleFonts.map(fam).join('&') + '&display=swap'

export function family(name) {
  return "'" + name + "', sans-serif"
}
