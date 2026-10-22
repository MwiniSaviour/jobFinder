export type ServiceListing = {
  id: number;
  name: string;
  category: string;
  provider: string;
  rating: number;
  reviews: number;
  price: number;
  priceLabel: string;
  duration: string;
  location: string;
  verified: string[];
};

export const SERVICE_LISTINGS: ServiceListing[] = [
  {
    id: 1,
    name: "Deep House Cleaning",
    category: "Home",
    provider: "Marisol Vega",
    rating: 4.9,
    reviews: 128,
    price: 95,
    priceLabel: "$95 flat",
    duration: "3-4 hours",
    location: "Riverside",
    verified: ["Identity checked", "Background check", "Supplies included"],
  },
  {
    id: 2,
    name: "Appliance Repair",
    category: "Repair",
    provider: "Devon Price",
    rating: 4.7,
    reviews: 86,
    price: 60,
    priceLabel: "$60+",
    duration: "1-2 hours",
    location: "City Center",
    verified: ["Identity checked", "Licensed technician"],
  },
  {
    id: 3,
    name: "Bike Tune-Up",
    category: "Maintenance",
    provider: "Tomas Ibarra",
    rating: 4.8,
    reviews: 54,
    price: 40,
    priceLabel: "$40",
    duration: "1 hour",
    location: "College Hill",
    verified: ["Identity checked", "Parts warranty"],
  },
  {
    id: 4,
    name: "IT Home Visit",
    category: "Tech",
    provider: "Aisha Karim",
    rating: 4.9,
    reviews: 203,
    price: 75,
    priceLabel: "$75",
    duration: "2 hours",
    location: "City Center",
    verified: ["Identity checked", "Background check", "Certified technician"],
  },
  {
    id: 5,
    name: "Moving Help",
    category: "Moving",
    provider: "Owen Brandt",
    rating: 4.6,
    reviews: 71,
    price: 25,
    priceLabel: "$25/hr",
    duration: "2+ hours",
    location: "Downtown",
    verified: ["Identity checked", "Equipment insured"],
  },
  {
    id: 6,
    name: "Dog Walking",
    category: "Pet",
    provider: "Nina Okafor",
    rating: 4.8,
    reviews: 96,
    price: 20,
    priceLabel: "$20",
    duration: "30 minutes",
    location: "Riverside",
    verified: ["Identity checked", "Background check"],
  },
  {
    id: 7,
    name: "Laundry & Fold Service",
    category: "Laundry & Dry Cleaning",
    provider: "Priya Raman",
    rating: 4.7,
    reviews: 63,
    price: 14,
    priceLabel: "From $14",
    duration: "1-2 hours",
    location: "Maplewood",
    verified: ["Identity checked", "Eco-friendly products"],
  },
  {
    id: 8,
    name: "Exterior Car Wash",
    category: "Car Wash",
    provider: "Bianca Ruiz",
    rating: 4.5,
    reviews: 44,
    price: 25,
    priceLabel: "$25",
    duration: "45 minutes",
    location: "Industrial Park",
    verified: ["Identity checked", "Water-safe products"],
  },
  {
    id: 9,
    name: "Weeknight Meal Prep",
    category: "Catering",
    provider: "Ren Takahashi",
    rating: 4.9,
    reviews: 112,
    price: 18,
    priceLabel: "From $18",
    duration: "2-3 hours",
    location: "City Center",
    verified: ["Identity checked", "Food handler certified"],
  },
  {
    id: 10,
    name: "At-Home Haircut",
    category: "Beauty & Wellness",
    provider: "Sofia Marchetti",
    rating: 4.8,
    reviews: 78,
    price: 30,
    priceLabel: "$30",
    duration: "1 hour",
    location: "Hillcrest",
    verified: ["Identity checked", "Licensed cosmetologist"],
  },
  {
    id: 11,
    name: "Dog Grooming",
    category: "Pet",
    provider: "Ellis Ward",
    rating: 4.6,
    reviews: 39,
    price: 35,
    priceLabel: "$35",
    duration: "1 hour",
    location: "Riverside",
    verified: ["Identity checked", "Pet first-aid certified"],
  },
  {
    id: 12,
    name: "Furniture Assembly",
    category: "Maintenance",
    provider: "Hector Salinas",
    rating: 4.7,
    reviews: 57,
    price: 35,
    priceLabel: "$35",
    duration: "2+ hours",
    location: "Northgate",
    verified: ["Identity checked", "Tools included"],
  },
];

export function serviceById(id: number): ServiceListing | undefined {
  return SERVICE_LISTINGS.find((service) => service.id === id);
}

export function servicePriceLabel(service: ServiceListing): string {
  return service.priceLabel;
}
