import restify, { Request, Response, Next } from 'restify';
import { CronJob } from 'cron';

interface DataResponse {
    success: boolean;
    method?: string;
    data?: any;
    error?: string;
}

export function createServer(name: string, port: number, cronInterval: string, targetPort: number) {
    const server = restify.createServer({
        name,
        version: '1.0.0'
    });

    server.use(restify.plugins.bodyParser());

    const handleRequest = (req: Request, res: Response, next: Next, method: string) => {
        const response: DataResponse = {
            success: true,
            method: method,
            data: `Привет с порта ${server.address().port}`
        };
        res.send(200, response);
        next();
    };

    // Определяем маршруты
    server.get('/getData', (req, res, next) => handleRequest(req, res, next, 'GET'));
    server.post('/postData', (req, res, next) => handleRequest(req, res, next, 'POST'));
    server.put('/putData', (req, res, next) => handleRequest(req, res, next, 'PUT'));
    server.del('/deleteData', (req, res, next) => handleRequest(req, res, next, 'DELETE'));
    server.on('NotFound', function (req, res, next) {
        const response: DataResponse = {
            success: false,
            method: req.method,
            data: "Ничего не найдено",
            error: "Ошибочный маршрут!"
        };
        res.send(404, response);
        next();
    });

    server.listen(port, () => {
        console.log('%s Запущен и доступен по адресу %s', server.name, server.url);
    });

    // Делает рандомный запрос на второй сервер каждые несколько секунд
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];

    new CronJob(cronInterval, () => {
        const method = methods[Math.floor(Math.random() * methods.length)];
        const options: RequestInit = { method };

        fetch(`http://localhost:${targetPort}/${method.toLowerCase()}Data`, options)
            .then(res => res.json())
            .then(data => console.log(`Ответ другого сервера с порта ${targetPort}: `, data))
            .catch(err => console.log('Ошибка: ', err));
    }).start();
}
