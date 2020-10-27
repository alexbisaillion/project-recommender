import { name, internet, company, lorem } from "faker";
import User from "../models/userModel";
import { IUser } from "../types/user";
import cities from "./cities.json";
import schools from "./schools.json";
import domains from "./domains.json";
import positions from "./positions.json";
import industries from "./industries.json";
import { Attribute, Employment, Framework, ProgrammingLanguage, Skill } from "../types/attributes";

const getRandomNum = (max: number, min: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomCompanies = (): string[] => {
  const numCompanies = getRandomNum(1, 5); // Initialize each city with between 1 and 5 companies
  const companies: string[] = [];
  for (let i = 0; i < numCompanies; i++) {
    companies.push(company.companyName());
  }
  return companies;
}

// Initialize companies at each city
const cityCompanies = new Map<string, string[]>();
for (let i = 0; i < cities.length; i++) {
  cityCompanies.set(cities[i], getRandomCompanies());
}
const allCompanies = [...cityCompanies.values()].reduce((accumulator, value) => accumulator.concat(value), []);

const getRandomAttribute = (attributes: any[]) => attributes[Math.floor(Math.random() * attributes.length)];
const getRandomAge = () => getRandomNum(60, 16);

const getRandomPosition = (regionCompany?: string): Employment => {
  const position: string = getRandomAttribute(positions);
  const domain: string = getRandomAttribute(domains);
  const randomCompany: string = !regionCompany ? getRandomAttribute(allCompanies) : regionCompany;
  return { company: randomCompany, position: domain + " " + position }
}

const getRandomPositions = (age: number): Employment[] => {
  const positions: Employment[] = [];
  // Min age is 16, so subtract 15
  for (let i = 0; i < Math.ceil((age - 15) / 5); i++) {
    const newPosition = getRandomPosition();
    if (positions.some(position => position.company === newPosition.company && position.position === newPosition.position)) {
      i--;
      continue;
    }
    positions.push(getRandomPosition());
  }
  return positions;
}

const getRandomAttributes = (attributes: string[]): Attribute[] => {
  const numAttributes = getRandomNum(1, 5);
  const chosenAttributes: Attribute[] = [];
  for (let i = 0; i < numAttributes; i++) {
    const attribute = getRandomAttribute(attributes);
    if (chosenAttributes.some(att => att.name === attribute)) {
      i--;
      continue;
    }
    chosenAttributes.push({ name: attribute, votes: 0});
  }
  return chosenAttributes;
} 

export const makeRandomUser = (): IUser => {
  const firstName = name.firstName();
  const lastName = name.lastName();
  const city = getRandomAttribute(cities);
  const age = getRandomAge();

  const newUser: IUser = new User({
    username: (firstName + lastName).toLowerCase(),
    password: internet.password(),
    name: firstName + " " + lastName,
    age: age,
    region: city,
    currentEmployment: getRandomPosition(getRandomAttribute(cityCompanies.get(city) ?? [])),
    pastEmployment: getRandomPositions(age),
    education: getRandomAttribute(schools),
    industry: getRandomAttribute(industries),
    skills: getRandomAttributes(Object.values(Skill)),
    programmingLanguages: getRandomAttributes(Object.values(ProgrammingLanguage)),
    frameworks: getRandomAttributes(Object.values(Framework)),
    projects: [],
    invitations: [],
    bio: lorem.sentence(),
  });

  return newUser;
}
