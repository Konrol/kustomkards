import { useEffect, useRef, useState } from 'react'
import { cards, factions, keywordLibrary, tokenCards } from './data/cards'
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

function isArtworkFile(image) {
  return image.startsWith('/') || image.startsWith('http')
}

function getArtworkUrl(image) {
  return image.startsWith('/') ? assetPath(image) : image
}

function getArtworkStyle(image) {
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

const keywordTerms = keywordLibrary.flatMap((keyword) => [
  keyword.name,
  ...(keyword.aliases || []),
])

const keywordByName = new Map(
  keywordLibrary.flatMap((keyword) =>
    [keyword.name, ...(keyword.aliases || [])].map((term) => [
      term.toLowerCase(),
      keyword,
    ]),
  ),
)

const keywordPattern = new RegExp(
  `\\b(${keywordTerms
    .sort((firstKeyword, secondKeyword) => secondKeyword.length - firstKeyword.length)
    .map(escapeRegExp)
    .join('|')})\\b`,
  'gi',
)

const tokenCardsById = new Map(tokenCards.map((token) => [token.id, token]))

function getCardTokenEntries(card) {
  return (card.tokenRefs || [])
    .map((tokenId) => tokenCardsById.get(tokenId))
    .filter(Boolean)
    .map((token) => [token.name.toLowerCase(), token])
}

function CardAbility({
  card,
  openKeywordName,
  openTokenId,
  openTokenKeywordName,
  onToggleKeyword,
  onToggleToken,
  onToggleTokenKeyword,
}) {
  if (!card.ability) {
    return null
  }

  const tokenEntries = getCardTokenEntries(card)
  const tokenTerms = tokenEntries.map(([, token]) => token.name)
  const abilityPattern =
    tokenTerms.length > 0
      ? new RegExp(
          `\\b(${[...keywordTerms, ...tokenTerms]
            .sort((firstTerm, secondTerm) => secondTerm.length - firstTerm.length)
            .map(escapeRegExp)
            .join('|')})\\b`,
          'gi',
        )
      : keywordPattern
  const abilityParts = card.ability.split(abilityPattern)
  const tokenByName = new Map(tokenEntries)

  if (abilityParts.length === 1) {
    return <p className="ability">{card.ability}</p>
  }

  return (
    <div className="ability-wrap">
      <p className="ability">
        {abilityParts.map((part, index) => {
          const keyword = keywordByName.get(part.toLowerCase())
          const token = tokenByName.get(part.toLowerCase())

          if (!keyword && !token) {
            return part
          }

          if (token) {
            const isTokenOpen = openTokenId === token.id

            return (
              <button
                className="token-trigger"
                type="button"
                aria-expanded={isTokenOpen}
                aria-controls={`token-desc-${card.id}-${token.id}`}
                onClick={() => onToggleToken(token.id)}
                key={`${card.id}-${part}-${index}`}
              >
                {part}
              </button>
            )
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

      {openTokenId && (
        <div id={`token-desc-${card.id}-${openTokenId}`}>
          <TokenPreview
            token={tokenCardsById.get(openTokenId)}
            openKeywordName={openTokenKeywordName}
            onToggleKeyword={onToggleTokenKeyword}
          />
        </div>
      )}
    </div>
  )
}

function TokenPreview({ token, openKeywordName, onToggleKeyword }) {
  if (!token) {
    return null
  }

  return (
    <article className="token-preview">
      <img
        className="token-preview-art"
        src={getArtworkUrl(token.image)}
        alt=""
        aria-hidden="true"
        draggable="false"
      />

      <div className="token-preview-details">
        <div className="token-preview-heading">
          <p className={`card-kicker rarity-${token.rarity.toLowerCase()}`}>
            {token.rarity}
          </p>
          <h3>{token.name}</h3>
        </div>

        <div className="metadata token-preview-metadata">
          <span>{token.type}</span>
          {token.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className="card-divider token-preview-divider" />

        <CardAbility
          card={token}
          openKeywordName={openKeywordName}
          openTokenId={null}
          openTokenKeywordName={null}
          onToggleKeyword={onToggleKeyword}
          onToggleToken={() => {}}
          onToggleTokenKeyword={() => {}}
        />
      </div>
    </article>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState('Gwent')
  const [activeFaction, setActiveFaction] = useState('MO')
  const [activeFilter, setActiveFilter] = useState('All')
  const [isNavCompact, setIsNavCompact] = useState(false)
  const [openKeyword, setOpenKeyword] = useState(null)
  const [openToken, setOpenToken] = useState(null)
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
    document.body.dataset.section = activeSection
    document.body.dataset.faction =
      activeSection === 'Gwent' ? activeFaction : 'Neutral'

    return () => {
      delete document.body.dataset.section
      delete document.body.dataset.faction
    }
  }, [activeFaction, activeSection])

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
            {visibleCards.map((card) => {
              const hasArtworkImage = isArtworkFile(card.image)

              return (
              <article className="card-reveal" key={card.id}>
                <button
                  type="button"
                  className={`card-art${hasArtworkImage ? ' card-art-image' : ''}`}
                  style={hasArtworkImage ? undefined : getArtworkStyle(card.image)}
                  aria-label={`Open larger artwork for ${card.name}`}
                  onClick={() => setSelectedCard(card)}
                >
                  {hasArtworkImage && (
                    <img
                      className="card-art-img"
                      src={getArtworkUrl(card.image)}
                      alt=""
                      aria-hidden="true"
                      draggable="false"
                    />
                  )}
                </button>

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
                    openTokenId={
                      openToken?.cardId === card.id ? openToken.tokenId : null
                    }
                    openTokenKeywordName={
                      openKeyword?.cardId === `${card.id}-${openToken?.tokenId}`
                        ? openKeyword.name
                        : null
                    }
                    onToggleKeyword={(keywordName) => {
                      setOpenToken(null)
                      setOpenKeyword((currentKeyword) =>
                        currentKeyword?.cardId === card.id &&
                        currentKeyword.name === keywordName
                          ? null
                          : { cardId: card.id, name: keywordName },
                      )
                    }}
                    onToggleToken={(tokenId) => {
                      setOpenKeyword(null)
                      setOpenToken((currentToken) =>
                        currentToken?.cardId === card.id &&
                        currentToken.tokenId === tokenId
                          ? null
                          : { cardId: card.id, tokenId },
                      )
                    }}
                    onToggleTokenKeyword={(keywordName) => {
                      const tokenKeywordCardId = `${card.id}-${openToken?.tokenId}`

                      setOpenKeyword((currentKeyword) =>
                        currentKeyword?.cardId === tokenKeywordCardId &&
                        currentKeyword.name === keywordName
                          ? null
                          : { cardId: tokenKeywordCardId, name: keywordName },
                      )
                    }}
                  />
                  {card.flavor && <p className="flavor">{card.flavor}</p>}
                </div>
              </article>
              )
            })}

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
            {isArtworkFile(selectedCard.image) ? (
              <img
                className="lightbox-art lightbox-art-image"
                src={getArtworkUrl(selectedCard.image)}
                alt={`Larger artwork for ${selectedCard.name}`}
                draggable="false"
              />
            ) : (
              <div
                className="lightbox-art"
                style={getArtworkStyle(selectedCard.image)}
              />
            )}

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
