const getIcon = (extension: string, iconSize = 14) => {
    const ArchiveIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M1792 0q27 0 50 10t40 27 28 41 10 50v480q0 45-9 77t-24 58-31 46-31 40-23 44-10 55v992q0 27-10 50t-27 40-41 28-50 10H256V0h1536zM640 128v384h256V128H640zm1024 800q0-31-9-54t-24-44-31-41-31-45-23-58-10-78V128h-512v512H768v128H640V640H512V128H384v1792h384v-128h128v128h768V928zm128-800h-128v480q0 24 4 42t13 33 20 29 27 32q15-17 26-31t20-30 13-33 5-42V128zM640 896h128v128H640V896zm0 256h128v128H640v-128zm0 256h128v128H640v-128zm128 256v128H640v-128h128zm0-768V768h128v128H768zm0 256v-128h128v128H768zm0 256v-128h128v128H768zm0 256v-128h128v128H768z" />
        </svg>
    );

    const AudioIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M1792 1408q0 62-29 109t-76 80-104 50-111 17q-54 0-111-17t-103-49-76-80-30-110q0-61 29-109t76-80 104-50 111-17q51 0 100 12t92 39V226L768 450v1214q0 62-29 109t-76 80-104 50-111 17q-54 0-111-17t-103-49-76-80-30-110q0-61 29-109t76-80 104-50 111-17q51 0 100 12t92 39V350L1792 62v1346z" />
        </svg>
    );

    const BlankIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M549 0h1243v1755l-293 293H256V293L549 0zm1115 1701V128H603L384 347v1573h1061l219-219z" />
        </svg>
    );

    const ExcelIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M2048 475v1445q0 27-10 50t-27 40-41 28-50 10H640q-27 0-50-10t-40-27-28-41-10-50v-256H115q-24 0-44-9t-37-25-25-36-9-45V627q0-24 9-44t25-37 36-25 45-9h397V128q0-27 10-50t27-40 41-28 50-10h933q26 0 49 9t42 28l347 347q18 18 27 41t10 50zm-384-256v165h165l-165-165zM261 1424h189q2-4 12-23t25-45 29-55 29-53 23-41 10-17q27 59 60 118t65 116h187l-209-339 205-333H707q-31 57-60 114t-63 112q-29-57-57-113t-57-113H279l199 335-217 337zm379 496h1280V512h-256q-27 0-50-10t-40-27-28-41-10-50V128H640v384h397q24 0 44 9t37 25 25 36 9 45v922q0 24-9 44t-25 37-36 25-45 9H640v256zm640-1024V768h512v128h-512zm0 256v-128h512v128h-512zm0 256v-128h512v128h-512z" />
        </svg>
    );

    const ImageIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M256 1920h1536v128H128V0h1115l549 549v91h-640V128H256v1792zM1280 512h293l-293-293v293zm768 256v1024H640V768h1408zM768 896v421l320-319 416 416 160-160 256 256V896H768zm987 768h139l-230-230-69 70 160 160zm-987 0h805l-485-486-320 321v165zm960-512q-26 0-45-19t-19-45q0-26 19-45t45-19q26 0 45 19t19 45q0 26-19 45t-45 19z" />
        </svg>
    );

    const OneNoteIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M1963 128q35 0 60 25t25 60v1622q0 35-25 60t-60 25H597q-35 0-60-25t-25-60v-299H85q-35 0-60-25t-25-60V597q0-35 25-60t60-25h427V213q0-35 25-60t60-25h1366zM389 939l242 420h152V689H635v429L402 689H241v670h148V939zm1531 853v-256h-256v256h256zm0-384v-256h-256v256h256zm0-384V768h-256v256h256zm0-384V256H640v256h299q35 0 60 25t25 60v854q0 35-25 60t-60 25H640v256h896V640h384z" />
        </svg>
    );

    const PDFIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M1920 1664h-128v384H128v-384H0V640h128V0h1243l421 421v219h128v1024zM1408 384h165l-165-165v165zM256 640h1408V512h-384V128H256v512zm1408 1024H256v256h1408v-256zm128-896H128v768h1664V768zM448 896q40 0 75 15t61 41 41 61 15 75q0 40-15 75t-41 61-61 41-75 15h-64v128H256V896h192zm0 256q26 0 45-19t19-45q0-26-19-45t-45-19h-64v128h64zm448-256q53 0 99 20t82 55 55 81 20 100q0 53-20 99t-55 82-81 55-100 20H768V896h128zm0 384q27 0 50-10t40-27 28-41 10-50q0-27-10-50t-27-40-41-28-50-10v256zm384-384h320v128h-192v128h192v128h-192v128h-128V896z" />
        </svg>
    );

    const PowerpointIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M2048 475v1445q0 27-10 50t-27 40-41 28-50 10H640q-27 0-50-10t-40-27-28-41-10-50v-256H115q-24 0-44-9t-37-25-25-36-9-45V627q0-24 9-44t25-37 36-25 45-9h397V128q0-27 10-50t27-40 41-28 50-10h933q26 0 49 9t42 28l347 347q18 18 27 41t10 50zm-384-256v165h165l-165-165zM368 752v672h150v-226h100q52 0 97-15t78-46 53-72 20-97q0-56-17-97t-50-67-76-39-97-13H368zm1552 1168V512h-256q-27 0-50-10t-40-27-28-41-10-50V128H640v384h397q24 0 44 9t37 25 25 36 9 45v922q0 24-9 44t-25 37-36 25-45 9H640v256h1280zM1536 640q79 0 149 30t122 82 83 123 30 149h-384V640zm-128 128v384h384q0 80-30 149t-82 122-123 83-149 30q-33 0-65-6t-63-18V792q31-11 63-17t65-7zm-804 300h-86V883h90q47 0 74 20t27 70q0 52-28 73t-77 22z" />
        </svg>
    );

    const VideoIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M0 256h2048v1408H0V256zm256 1280v-128H128v128h128zm0-256v-128H128v128h128zm0-256V896H128v128h128zm0-256V640H128v128h128zm0-256V384H128v128h128zm1408 786V384H384v823l411-549 741 878-329-558 137-137 320 457zm256 238v-128h-128v128h128zm0-256v-128h-128v128h128zm0-256V896h-128v128h128zm0-256V640h-128v128h128zm0-256V384h-128v128h128z" />
        </svg>
    );

    const VisioIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M2048 475v1445q0 27-10 50t-27 40-41 28-50 10H640q-27 0-50-10t-40-27-28-41-10-50v-256H115q-24 0-44-9t-37-25-25-36-9-45V627q0-24 9-44t25-37 36-25 45-9h397V128q0-27 10-50t27-40 41-28 50-10h933q26 0 49 9t42 28l347 347q18 18 27 41t10 50zm-384-256v165h165l-165-165zM493 1424h163l255-672H745l-147 427q-5 16-10 31t-11 31q-41-123-82-244t-84-245H241l248 662 4 10zm147 496h1280V512h-256q-27 0-50-10t-40-27-28-41-10-50V128H640v384h397q24 0 44 9t37 25 25 36 9 45v922q0 24-9 44t-25 37-36 25-45 9H640v256zm960-1280l192 192-128 128v448h-256v128h-128v-384h128v128h128V960l-128-128 192-192z" />
        </svg>
    );

    const WordIcon = (
        <svg xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2048 2048"
            width={iconSize}
            height={iconSize}>
            <path d="M2048 475v1445q0 27-10 50t-27 40-41 28-50 10H640q-27 0-50-10t-40-27-28-41-10-50v-256H115q-24 0-44-9t-37-25-25-36-9-45V627q0-24 9-44t25-37 36-25 45-9h397V128q0-27 10-50t27-40 41-28 50-10h933q26 0 49 9t42 28l347 347q18 18 27 41t10 50zm-384-256v165h165l-165-165zM320 1424h161q2-8 9-43t18-83 21-103 22-101 16-76 8-31l7 30q7 30 17 77t23 100 23 103 19 84 10 43h160l148-672H834l-80 438-100-438H502l-96 440-86-440H170l150 672zm320 496h1280V512h-256q-27 0-50-10t-40-27-28-41-10-50V128H640v384h397q24 0 44 9t37 25 25 36 9 45v922q0 24-9 44t-25 37-36 25-45 9H640v256zm640-1024V768h512v128h-512zm0 256v-128h512v128h-512zm0 256v-128h512v128h-512z" />
        </svg>
    );

    const FileAttachmentIconMap: {[key: string]: any} = {
        "aac": AudioIcon,
        "aiff": AudioIcon,
        "alac": AudioIcon,
        "avchd": VideoIcon,
        "avi": VideoIcon,
        "bmp": ImageIcon,
        "doc": WordIcon,
        "docx": WordIcon,
        "flac": AudioIcon,
        "flv": VideoIcon,
        "gif": ImageIcon,
        "jiff": ImageIcon,
        "jpeg": ImageIcon,
        "jpg": ImageIcon,
        "mpe": VideoIcon,
        "mpeg": VideoIcon,
        "mpg": VideoIcon,
        "mpv": VideoIcon,
        "mp2": AudioIcon,
        "mp3": AudioIcon,
        "mp4": VideoIcon,
        "m4p": VideoIcon,
        "m4v": VideoIcon,
        "mov": VideoIcon,
        "one": OneNoteIcon,
        "pcm": AudioIcon,
        "pdf": PDFIcon,
        "png": ImageIcon,
        "ppt": PowerpointIcon,
        "pptx": PowerpointIcon,
        "qt": VideoIcon,
        "rar": ArchiveIcon,
        "swf": VideoIcon,
        "tar": ArchiveIcon,
        "tar.gz": ArchiveIcon,
        "tgz": ArchiveIcon,
        "txt": BlankIcon,
        "vsd": VisioIcon,
        "vsdx": VisioIcon,
        "wav": AudioIcon,
        "webm": VideoIcon,
        "wma": AudioIcon,
        "wmv": VideoIcon,
        "xls": ExcelIcon,
        "xlsx": ExcelIcon,
        "zip": ArchiveIcon,
        "zipx": ArchiveIcon,
        "7z": ArchiveIcon,
    };

    const key = extension.startsWith(".") ? extension.slice(1) : extension || "";
    const icon = FileAttachmentIconMap[key.toLowerCase()] || BlankIcon;
    return icon;
}

interface propsIconProps {
    name: string;
}

const AttachmentIcon = (props: propsIconProps) => {
    const fileExtension = props.name.substring(props.name.lastIndexOf('.') + 1, props.name.length) || props.name;
    const style = {
        padding: '0 0 0 8px'
    }

    return (
        <div style={style}>
            {getIcon(fileExtension)}
        </div>
    )
}

export default AttachmentIcon;