const axios = require("axios");

const main = async () => {
    const sessionCookie = 'JSESSIONID=6C3630C62AD56F281538DA2C803A0140'; // Reemplazar con cookie de sesión real
    const baseUrl = 'https://dev-saas.cms-medios.com';

    const client = axios.create({
        baseURL: baseUrl,
        headers: {
            'User-Agent': 'app-comments-tester',
            'Cookie': sessionCookie,
        },
    });

    const commentsTest = [
        {
            newsPath: "/contenidos/2025/11/07/noticia_0002.html",
            text: "Esto pasa porque nadie hace nada, todos los políticos son unos hijos de mil puta que no entienden el problema real.",
            performer: "Ramiro Costas",
        },
        {
            newsPath: "/contenidos/2025/11/07/noticia_0002.html",
            text: "La juventud se va al re carajo, todo culpa de un sistema que no se preocupa por educar.",
            performer: "Paula Giménez",
        },
        {
            newsPath: "/contenidos/2025/11/07/noticia_0002.html",
            text: "Siempre lo mismo, hablan y no hacen nada. Puro marketing y promesas vacias llenas de esperanza de mierda.",
            performer: "Lucas Fariña",
        },
        {
            newsPath: "/contenidos/2025/11/07/noticia_0002.html",
            text: "Si no controlan el tráfico de drogas, esto va a seguir siendo un desastre de nunca acabar.",
            performer: "Brenda López",
        },
        {
            newsPath: "/contenidos/2025/11/07/noticia_0002.html",
            text: "No hay conciencia ni educación, solo hipocresía y discursos baratos llenos de mierda que no sirven de nada.",
            performer: "Matías Corvalán",
        },
    ]



    for (let index = 0; index < commentsTest.length; index++) {
        const comment = commentsTest[index];
        const params = {
            newsPath: comment.newsPath,
            text: comment.text,
            performer: comment.performer,
            submit: "Enviar",
            siteName: "/sites/gammers",
            publication: "16",
        };

        if (comment.parentId) params.parentId = comment.parentId;

        try {
            const response = await client.get('/.process/comments/add', { params });

            if (response.status === 200) {
                console.log('Respuesta exitosa del servidor para el comentario:' + index);
            } else {
                console.log('Error en la Respuesta del servidor para el comentario: ' + index, response.status);
            }

        } catch (err) {
            console.error('Error critico al ejecutar el fetch:', err);
        }
    }
};

main();
