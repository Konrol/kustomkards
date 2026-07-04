import { useEffect, useRef, useState } from 'react'
import { cards, factions, keywordLibrary } from './data/cards'
import './App.css'

const assetPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const factionIcons = {
  Neutral: assetPath('/factions/neutral.png'),
  MO: assetPath('/factions/mo.png'),
  NG: assetPath('/factions/ng.png'),
  ST: assetPath('/factions/st.png'),
  SY: assetPath('/factions/sy.png'),
  SK: assetPath('/factions/sk.png'),
  NR: assetPath('/factions/nr.png'),
}

const cardFilters = {
  types: ['Unit', 'Special', 'Artifact', 'Leader'],
  rarities: ['Legendary', 'Epic', 'Rare', 'Common'],
}

const sections = ['Gwent', 'Pokemon', 'Garbodecks']

const sectionDescriptions = {
  Gwent:
    'This is a library of my custom cards for Gwent: The Witcher Card Game. I do not own rights to the game, these are just fan-made creations for entertainment purposes only.',
  Pokemon:
    'This is a library of my custom cards for Pokemon TCG. I do not own rights to the game, these are just fan-made creations for entertainment purposes only.',
  Garbodecks:
    'Garbodecks is my own personal project, so stay tuned for more!',
}

const sectionDisclaimers = {
  Gwent:
    'This is an unofficial, non-commercial fan project. GWENT: The Witcher Card Game, The Witcher, and related names, artwork, setting, and game concepts are trademarks and/or copyrighted works of CD PROJEKT S.A., CD PROJEKT RED, and their respective rights holders. This site is not affiliated with, endorsed by, sponsored by, or approved by CD PROJEKT S.A. or CD PROJEKT RED. Custom cards shown here are fan-made creations for entertainment and personal portfolio purposes only.',
  Pokemon:
    'This is an unofficial, non-commercial fan project. Pokemon, Pokemon TCG, and related names, characters, artwork, setting, and game concepts are trademarks and/or copyrighted works of Nintendo, The Pokemon Company, Game Freak, Creatures Inc., and their respective rights holders. This site is not affiliated with, endorsed by, sponsored by, or approved by Nintendo, The Pokemon Company, Game Freak, or Creatures Inc. Custom cards shown here are fan-made creations for entertainment and personal portfolio purposes only.',
  Garbodecks:
    'This section includes content that is part of my IP, all ideas, artwork and content belongs to me.',
}

function SiteIcon() {
  const [hasIconError, setHasIconError] = useState(false)

  return (
    <img
      className="site-nav-icon"
      src={
        hasIconError
          ? assetPath('/factions/neutral.png')
          : assetPath('/branding/site-icon.png')
      }
      alt=""
      aria-hidden="true"
      onError={() => setHasIconError(true)}
    />
  )
}

function FactionIcon({ faction }) {
  const [hasImageError, setHasImageError] = useState(false)

  if (hasImageError) {
    return <span className="faction-fallback">{faction}</span>
  }

  return (
    <img
      className="faction-icon"
      src={factionIcons[faction]}
      alt=""
      onError={() => setHasImageError(true)}
    />
  )
}

function getArtworkStyle(image) {
  const isFilePath = image.startsWith('/') || image.startsWith('http')

  if (isFilePath) {
    return {
      backgroundImage: `url(${image.startsWith('/') ? assetPath(image) : image})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
    }
  }

  return { background: image }
}

function SiteTitle() {
  const [hasLogoError, setHasLogoError] = useState(false)

  if (hasLogoError) {
    return <h1>Kustom Kards</h1>
  }

  return (
    <h1 className="site-title-logo">
      <img
        src={assetPath('/branding/kustom-kards-title.png')}
        alt="Kustom Kards"
        onError={() => setHasLogoError(true)}
      />
    </h1>
  )
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const keywordByName = new Map(
  keywordLibrary.map((keyword) => [keyword.name.toLowerCase(), keyword]),
)

const keywordPattern = new RegExp(
  `\\b(${keywordLibrary
    .map((keyword) => keyword.name)
    .sort((firstKeyword, secondKeyword) => secondKeyword.length - firstKeyword.length)
    .map(escapeRegExp)
    .join('|')})\\b`,
  'gi',
)

function CardAbility({ card, openKeywordName, onToggleKeyword }) {
  if (!card.ability) {
    return null
  }

  const abilityParts = card.ability.split(keywordPattern)

  if (abilityParts.length === 1) {
    return <p className="ability">{card.ability}</p>
  }

  return (
    <div className="ability-wrap">
      <p className="ability">
        {abilityParts.map((part, index) => {
          const keyword = keywordByName.get(part.toLowerCase())

          if (!keyword) {
            return part
          }

          const isKeywordOpen = openKeywordName === keyword.name

          return (
            <button
              className={
                keyword.isNew
                  ? 'keyword-trigger keyword-trigger-new'
                  : 'keyword-trigger'
              }
              type="button"
              aria-expanded={isKeywordOpen}
              aria-controls={`keyword-desc-${card.id}-${keyword.name}`}
              onClick={() => onToggleKeyword(keyword.name)}
              key={`${card.id}-${part}-${index}`}
            >
              {part}
            </button>
          )
        })}
      </p>

      {openKeywordName && (
        <div
          className={
            keywordByName.get(openKeywordName.toLowerCase())?.isNew
              ? 'keyword-desc keyword-desc-new'
              : 'keyword-desc'
          }
          id={`keyword-desc-${card.id}-${openKeywordName}`}
        >
          <strong>{openKeywordName}</strong>
          <p>{keywordByName.get(openKeywordName.toLowerCase())?.desc}</p>
        </div>
      )}
    </div>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState('Gwent')
  const [activeFaction, setActiveFaction] = useState('Neutral')
  const [activeFilter, setActiveFilter] = useState('All')
  const [isNavCompact, setIsNavCompact] = useState(false)
  const [openKeyword, setOpenKeyword] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const headerRef = useRef(null)

  const visibleCards = cards
    .filter((card) => {
      const matchesFaction = card.faction === activeFaction
      const matchesType = card.type === activeFilter
      const matchesRarity = card.rarity === activeFilter
      const matchesFilter = activeFilter === 'All' || matchesType || matchesRarity

      return matchesFaction && matchesFilter
    })
    .sort((firstCard, secondCard) => secondCard.provision - firstCard.provision)

  useEffect(() => {
    const root = document.documentElement
    const assetVariables = {
      '--site-background-image': `url('${assetPath('/backgrounds/site-background.jpg')}')`,
      '--header-background-image': `url('${assetPath('/backgrounds/header-background.jpg')}')`,
      '--page-frame-left-image': `url('${assetPath('/frames/page-frame-left.png')}')`,
      '--page-frame-right-image': `url('${assetPath('/frames/page-frame-right.png')}')`,
    }

    Object.entries(assetVariables).forEach(([name, value]) => {
      root.style.setProperty(name, value)
    })

    return () => {
      Object.keys(assetVariables).forEach((name) => {
        root.style.removeProperty(name)
      })
    }
  }, [])

  useEffect(() => {
    document.body.dataset.faction = activeFaction

    return () => {
      delete document.body.dataset.faction
    }
  }, [activeFaction])

  useEffect(() => {
    const updateNavMode = () => {
      const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0

      setIsNavCompact(headerBottom <= 0)
    }

    updateNavMode()
    window.addEventListener('scroll', updateNavMode, { passive: true })
    window.addEventListener('resize', updateNavMode)

    return () => {
      window.removeEventListener('scroll', updateNavMode)
      window.removeEventListener('resize', updateNavMode)
    }
  }, [])

  useEffect(() => {
    if (!selectedCard) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedCard(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedCard])

  return (
    <main className="showcase-shell">
      <header
        className={isNavCompact ? 'site-nav compact' : 'site-nav'}
        aria-label="Site sections"
      >
        <SiteIcon />

        <nav className="site-nav-tabs">
          {sections.map((section) => (
            <button
              className={section === activeSection ? 'site-nav-tab active' : 'site-nav-tab'}
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </nav>

        <label className="site-nav-select-label">
          <span>Section</span>
          <select
            className="site-nav-select"
            value={activeSection}
            onChange={(event) => setActiveSection(event.target.value)}
          >
            {sections.map((section) => (
              <option value={section} key={section}>
                {section}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="showcase-header" ref={headerRef}>
        <SiteTitle />
        <p className="intro">{sectionDescriptions[activeSection]}</p>
      </section>

      {activeSection === 'Gwent' ? (
        <>
          <div className="filter-row">
            <div className="faction-control">
              <p className="faction-label">
                Faction: <span>{activeFaction.toUpperCase()}</span>
              </p>

              <nav className="faction-tabs" aria-label="Faction filters">
                {factions.map((faction) => (
                  <button
                    className={faction === activeFaction ? 'tab active' : 'tab'}
                    key={faction}
                    onClick={() => setActiveFaction(faction)}
                    aria-label={faction}
                    title={faction}
                    type="button"
                  >
                    <FactionIcon faction={faction} />
                  </button>
                ))}
              </nav>
            </div>

            <label className="sort-control">
              <span>Sort</span>
              <select
                value={activeFilter}
                onChange={(event) => setActiveFilter(event.target.value)}
              >
                <option value="All">All cards</option>
                {cardFilters.types.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
                <option disabled>--------</option>
                {cardFilters.rarities.map((rarity) => (
                  <option value={rarity} key={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="card-list" aria-live="polite">
            {visibleCards.map((card) => (
              <article className="card-reveal" key={card.id}>
                <button
                  type="button"
                  className="card-art"
                  style={getArtworkStyle(card.image)}
                  aria-label={`Open larger artwork for ${card.name}`}
                  onClick={() => setSelectedCard(card)}
                />

                <div className="card-details">
                  <div className="card-heading">
                    <p className={`card-kicker rarity-${card.rarity.toLowerCase()}`}>
                      {card.rarity}
                    </p>
                    <h2>{card.name}</h2>
                  </div>

                  <div className="metadata">
                    <span>{card.type}</span>
                    {card.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  {(card.ability || card.flavor) && <div className="card-divider" />}

                  <CardAbility
                    card={card}
                    openKeywordName={
                      openKeyword?.cardId === card.id ? openKeyword.name : null
                    }
                    onToggleKeyword={(keywordName) => {
                      setOpenKeyword((currentKeyword) =>
                        currentKeyword?.cardId === card.id &&
                        currentKeyword.name === keywordName
                          ? null
                          : { cardId: card.id, name: keywordName },
                      )
                    }}
                  />
                  {card.flavor && <p className="flavor">{card.flavor}</p>}
                </div>
              </article>
            ))}

            {visibleCards.length === 0 && (
              <p className="empty-state">
                No cards match this faction and sort selection yet.
              </p>
            )}
          </section>
        </>
      ) : (
        <section className="coming-soon-panel">
          <p>{activeSection}</p>
          <h1>Coming soon!</h1>
        </section>
      )}

      <footer className="site-disclaimer">
        <p>{sectionDisclaimers[activeSection]}</p>
      </footer>

      {selectedCard && (
        <div
          className="artwork-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedCard.name} artwork preview`}
          onClick={() => setSelectedCard(null)}
        >
          <button
            className="lightbox-close"
            type="button"
            aria-label="Close artwork preview"
            onClick={() => setSelectedCard(null)}
          >
            X
          </button>

          <div
            className="lightbox-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="lightbox-art"
              style={getArtworkStyle(selectedCard.image)}
            />

            <div className="art-credit-box">
              <p>
                <strong>Art by:</strong>{' '}
                {selectedCard.artCredit || 'Add artist credit in src/data/cards.js'}
              </p>

              {selectedCard.artReference && (
                <a
                  href={selectedCard.artReference}
                  target="_blank"
                  rel="noreferrer"
                >
                  View reference
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
