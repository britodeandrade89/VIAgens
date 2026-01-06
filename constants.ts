
import { TicketDetails, SafariOption, ItineraryDay } from './types.ts';

export const INTERNATIONAL_FLIGHTS = {
  ida: {
    route: "GRU ➔ JNB",
    airline: "TAAG Angola Airlines",
    flight: "DT 748 + DT 577",
    departure: "25/01 - 18:05",
    arrival: "26/01 - 14:40",
    layover: "Luanda (LAD) - 3h 15m",
    status: "Confirmado",
    details: "Conexão em Luanda com troca de aeronave."
  },
  volta: {
    route: "JNB ➔ GRU",
    airline: "TAAG Angola Airlines",
    flight: "DT 576 + DT 747",
    departure: "06/02 - 00:45",
    arrival: "06/02 - 15:05",
    layover: "Luanda (LAD) - 7h 05m",
    status: "Confirmado",
    details: "Retorno diurno no trecho final para o Brasil."
  }
};

export const TAAG_TICKET_INFO: TicketDetails = {
  bookingId: "862508329300",
  checkInCode: "BJDTCL",
  passengers: [
    { name: "André Victor Brito de Andrade", idDoc: "12666966798", eTicket: "1186055770451" },
    { name: "Marcelly Bispo Pereira da Silva", idDoc: "14019271739", eTicket: "1186055770450" }
  ]
};

export const REGIONS = {
  jnb_melville: {
    id: "jnb_melville",
    name: "Richmond / Melville",
    city: "Joanesburgo",
    profile: "Zona Boêmia & Tranquila",
    rioEquivalent: "Urca / Santa Teresa",
    safety: "Alta",
    description: "Vilas residenciais, cafés charmosos e livrarias. Ótimo para caminhar de dia."
  },
  jnb_sandton: {
    id: "jnb_sandton",
    name: "Sandton",
    city: "Joanesburgo",
    profile: "Zona Rica & Financeira",
    rioEquivalent: "Leblon / Barra",
    safety: "Média-Alta",
    description: "O centro financeiro. Shoppings de luxo, hotéis de rede e hub do Gautrain."
  },
  cpt_seapoint: {
    id: "cpt_seapoint",
    name: "Sea Point",
    city: "Cidade do Cabo",
    profile: "Zona Turística & Orla",
    rioEquivalent: "Ipanema / Copacabana",
    safety: "Alta",
    description: "Melhor calçadão para caminhadas. Próximo a tudo via Uber."
  }
};

export const ACCOMMODATIONS = [
  {
    id: "jnb_garden_cottage",
    regionId: "jnb_melville",
    name: "Garden Cottage in Richmond nr Melville",
    isPreferred: true,
    rating: 9.7,
    pricePerNight: 146.25,
    priceTotal: 585.00,
    period: "02/02 a 06/02",
    nights: 4,
    link: "https://www.booking.com/hotel/za/garden-cottage-in-richmond-nr-melville.pt-br.html",
    location: "16 Chatou Rd, Richmond",
    amenities: ["Piscina Privativa", "Cozinha Completa", "Jardim", "Wi-Fi Nota 10"],
    distances: [{ place: "7th Street Melville", dist: "1.2 km" }],
    breakfast: "Incluso (Genius)",
    cancellation: "Grátis até 28/01"
  },
  {
    id: "jnb_luxury_sandton",
    regionId: "jnb_sandton",
    name: "The Capital Sandton",
    rating: 8.5,
    pricePerNight: 450.00,
    priceTotal: 1800.00,
    period: "02/02 a 06/02",
    nights: 4,
    link: "https://www.booking.com/hotel/za/the-capital-sandton.pt-br.html",
    location: "Sandton Central",
    amenities: ["Ginásio", "Piscina", "Serviço de Quarto"],
    distances: [{ place: "Sandton City Mall", dist: "600m" }],
    breakfast: "Pago à parte",
    cancellation: "Não reembolsável"
  },
  {
    id: "cpt_home_suite",
    regionId: "cpt_seapoint",
    name: "Home Suite Hotels Sea Point",
    rating: 8.9,
    pricePerNight: 350.00,
    priceTotal: 2450.00,
    period: "26/01 a 02/02",
    nights: 7,
    link: "https://www.booking.com/hotel/za/home-suite-hotels-sea-point.pt-br.html",
    location: "50 London Rd, Sea Point",
    amenities: ["Rooftop Pool", "Nespresso", "Segurança 24h"],
    distances: [{ place: "Orla Sea Point", dist: "200m" }],
    breakfast: "Incluso",
    cancellation: "Grátis 7 dias antes"
  }
];

export const BUS_LOGISTICS = {
  via_leme: {
    ida: [
      { id: 'l1', from: 'RJ', to: 'Leme', time: '00:05', price: 93, date: '22/01' },
      { id: 'l2', from: 'Leme', to: 'GRU', time: '08:30', price: 119, date: '25/01' }
    ]
  },
  direto_sp: {
    ida: [
      { id: 'd1', from: 'RJ (Novo Rio)', to: 'Tietê', time: '06:15', price: 124, date: '25/01' },
      { id: 'd2', from: 'Tietê', to: 'GRU', time: '14:10', price: 32, date: '25/01' }
    ]
  },
  retorno: [
    { id: 'r1', from: 'GRU', to: 'Tietê', time: '16:20', price: 41, date: '06/02' },
    { id: 'r2', from: 'Tietê', to: 'RJ', time: '18:05', price: 93, date: '06/02' }
  ]
};

export const LOGISTICS_TIMELINE = [
  { time: '14:40', task: 'Pouso DT 577 em JNB', warning: false },
  { time: '15:40', task: 'Imigração & Coleta de Malas', warning: true },
  { time: '17:15', task: 'Check-in South African Airways', warning: false },
  { time: '18:45', task: 'Decolagem para CPT', highlight: true }
];

export const SAA_FLIGHT_DEAL = {
  company: "South African Airways",
  roundTripPrice: 872.00,
  outbound: { date: "26/01", time: "18:45", arrival: "21:00" },
  return: { date: "02/02", time: "12:20", arrival: "14:20" }
};

export const SURVIVAL_TIPS = {
  items: [
    { title: "Transporte", icon: "🚗", text: "Use Uber Black em JNB. Gautrain é ótimo mas fecha às 20:30." },
    { title: "Bariátrica", icon: "🍱", text: "Biltong (carne seca) é 50% proteína. Perfeito para o pós." },
    { title: "Internet", icon: "🌐", text: " Vodacom ou MTN têm as melhores coberturas." },
    { title: "Segurança", icon: "🛡️", text: "Celular sempre guardado. Use o Uber dentro dos locais." }
  ]
};
