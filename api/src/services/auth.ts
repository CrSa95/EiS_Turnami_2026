export default class AuthService {
    async login(email: String, password: String){
        if(password !== "contraseñaEjemplo"){
            throw new Error("Error al iniciar sesión, intente nuevamente")
        }
    }
}
