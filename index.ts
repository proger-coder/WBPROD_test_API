import { createServer } from './server';

createServer('Server_one', 2022, '*/7 * * * * *', 2023);
createServer('Server_two', 2023, '*/10 * * * * *', 2022);
