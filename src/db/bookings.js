/**
 * Bookings — Supabase DB Layer
 * All database queries for the booking system
 */
const { supabase } = require('../config');

async function getActiveBooking(userId) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('booking_date', new Date().toISOString().split('T')[0])
      .order('booking_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) { console.error('getActiveBooking error:', error); return null; }
    return data;
  } catch (err) {
    console.error('Exception in getActiveBooking:', err);
    return null;
  }
}

async function getBookedSlots(date) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('booking_time')
      .eq('booking_date', date)
      .eq('status', 'confirmed');

    if (error) { console.error('getBookedSlots error:', error); return []; }
    return (data || []).map(r => r.booking_time);
  } catch (err) {
    console.error('Exception in getBookedSlots:', err);
    return [];
  }
}

async function isSlotBooked(date, time) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', date)
      .eq('booking_time', time)
      .eq('status', 'confirmed')
      .limit(1)
      .maybeSingle();

    if (error) { console.error('isSlotBooked error:', error); return false; }
    return !!data;
  } catch (err) {
    console.error('Exception in isSlotBooked:', err);
    return false;
  }
}

async function saveBooking(userId, date, time) {
  const { error } = await supabase.from('bookings').insert({
    user_id: userId,
    booking_date: date,
    booking_time: time,
    status: 'confirmed',
  });
  if (error) throw error;
}

async function cancelBooking(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .select();

  if (error) throw error;
  return data?.length > 0;
}

module.exports = {
  getActiveBooking,
  getBookedSlots,
  isSlotBooked,
  saveBooking,
  cancelBooking,
};
