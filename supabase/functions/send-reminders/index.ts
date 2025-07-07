import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { format } from 'https://deno.land/std@0.177.0/datetime/mod.ts';

// The main Deno.serve function that will be triggered.
Deno.serve(async (req) => {
    try {
        // 1. Create a Supabase client with the appropriate credentials.
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // 2. Define the time range for fetching appointments (next 24 hours).
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        console.log(`Searching for appointments between: ${now.toISOString()} and ${tomorrow.toISOString()}`);

        // 3. Fetch appointments within the next 24 hours for patients who have consented.
        const { data: allAppointments, error: appointmentsError } = await supabaseClient
            .from('appointments')
            .select(`
                start_time,
                patients (
                    first_name,
                    last_name,
                    phone_number,
                    allow_whatsapp_reminders
                )
            `)
            .gte('start_time', now.toISOString())
            .lte('start_time', tomorrow.toISOString())
            .neq('status', 'cancelled');

        if (appointmentsError) {
            console.error("Supabase query error:", appointmentsError);
            throw new Error(`Error fetching appointments: ${appointmentsError.message}`);
        }

        console.log(`Found ${allAppointments?.length || 0} total appointments in the time range.`);
        console.log("Raw appointments data:", JSON.stringify(allAppointments, null, 2));


        if (!allAppointments || allAppointments.length === 0) {
            return new Response(JSON.stringify({ message: 'No appointments in the next 24 hours.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Filter appointments in code to ensure consent is respected
        const appointmentsToRemind = allAppointments.filter(
            (appt) => appt.patients && appt.patients.allow_whatsapp_reminders === true
        );

        console.log(`Found ${appointmentsToRemind.length} appointments with consent.`);
        console.log("Filtered appointments to remind:", JSON.stringify(appointmentsToRemind, null, 2));

        if (appointmentsToRemind.length === 0) {
            return new Response(JSON.stringify({ message: 'No appointments with consent to remind.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 4. Get Twilio credentials from environment variables.
        const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

        if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
            throw new Error('Twilio credentials are not set in environment variables.');
        }

        // 5. Process each appointment and send a reminder using fetch.
        const reminderPromises = appointmentsToRemind.map(async (appointment) => {
            const patient = appointment.patients;
            if (!patient || !patient.phone_number) {
                console.warn(`Skipping reminder for appointment due to missing patient data or phone number.`);
                return;
            }

            const appointmentTime = format(new Date(appointment.start_time), 'h:mm a');
            const messageBody = `Hola ${patient.first_name}, te recordamos tu cita en OrthoSmile Dental mañana a las ${appointmentTime}. ¡Te esperamos!`;

            const toPhoneNumber = `whatsapp:${patient.phone_number.startsWith('+') ? patient.phone_number : '+52' + patient.phone_number}`;
            const fromPhoneNumber = `whatsapp:${twilioPhoneNumber}`;

            const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

            const params = new URLSearchParams();
            params.append('To', toPhoneNumber);
            params.append('From', fromPhoneNumber);
            params.append('Body', messageBody);

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params,
                });

                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(`Twilio API error: ${errorBody.message}`);
                }

                console.log(`Reminder sent to ${toPhoneNumber}`);

            } catch (error) {
                console.error(`Failed to send reminder to ${toPhoneNumber}:`, error);
            }
        });

        await Promise.all(reminderPromises);

        return new Response(JSON.stringify({ message: `Processed ${appointmentsToRemind.length} reminders.` }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error in Edge Function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
