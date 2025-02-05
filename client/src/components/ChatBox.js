import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io.connect("https://bricked.onrender.com", {
    transports: ["websocket"],
});

const Chatbox = () => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => socket.off("receive_message");
    }, []);

    const sendMessage = () => {
        if (message.trim() !== "") {
            socket.emit("send_message", message);
            setMessage("");
        }
    };

    return (
        <div className="chatbox" style={styles.container}>
            <div className="chat-messages" style={styles.messages}>
                {messages.map((msg, index) => (
                    <div key={index} style={styles.message}>{msg}</div>
                ))}
            </div>
            <div className="chat-input" style={styles.inputContainer}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.input}
                />
                <button onClick={sendMessage} style={styles.button}>Send</button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        border: "1px solid #ccc",
        padding: "10px",
        width: "300px",
        height: "400px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f9f9f9",
    },
    messages: {
        flexGrow: 1,
        overflowY: "auto",
        padding: "5px",
        borderBottom: "1px solid #ccc",
    },
    message: {
        padding: "5px",
        backgroundColor: "#fff",
        marginBottom: "5px",
        borderRadius: "5px",
    },
    inputContainer: {
        display: "flex",
    },
    input: {
        flexGrow: 1,
        padding: "5px",
    },
    button: {
        padding: "5px 10px",
        cursor: "pointer",
    },
};

export default Chatbox;
