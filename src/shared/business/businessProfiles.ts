import { BusinessType } from '../types';
import { BARBER_PROFILE } from './barberProfile';
import { BusinessProfile } from './profileTypes';
import { RESTAURANT_PROFILE } from './restaurantProfile';
import { STORE_PROFILE } from './storeProfile';

export const getBusinessProfile = (type: BusinessType): BusinessProfile => {
  if (type === 'restaurant') return RESTAURANT_PROFILE;
  if (type === 'store') return STORE_PROFILE;
  return BARBER_PROFILE;
};
