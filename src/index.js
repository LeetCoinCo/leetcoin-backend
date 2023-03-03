"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./storage/db");
dotenv_1.default.config(); // loads environment variables from .env file
const app = (0, express_1.default)();
const port = 8080; // default port to listen
function initDB() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = db_1.PsqlDB.getInstance();
        const client = yield db.getClient();
        try {
            yield client.query('SELECT NOW()');
        }
        catch (err) {
            console.log(`failed to initialize db: ${err}`);
            throw err;
        }
    });
}
app.use(express_1.default.json());
app.use('/api', routes_1.default);
app.use('/debug', (req, res) => {
    res.send('Hello world!');
});
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    // await initDB();
    console.log(`Server started at http://localhost:${port}`);
}));
//# sourceMappingURL=index.js.map