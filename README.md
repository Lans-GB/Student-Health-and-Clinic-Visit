# Student-Health-and-Clinic-Visit WEB

## Overview

This is a simple web-based application designed to manage student information and track their health records efficiently. It provides a centralized interface to **add, edit, search, and view students**, along with their health details, all stored locally in the browser.

---

## Features

* **Add Student**: Input and save student details including name, age, grade, and contact information.
* **Edit Student Information**: Update existing student records easily.
* **Search Students**: Quickly find student records by name or ID.
* **Health Records Management**: Record and view students’ medical conditions, allergies, and other health-related information.
* **Display All Information**: View all student data in a structured table format.
* **Local Storage Support**: All data is saved in the browser's local storage, making it persistent across sessions.
* **User-Friendly Interface**: Clean layout with clear sections for student data and health records.

---

## Technologies Used

* HTML, CSS, JavaScript
* LocalStorage API for data persistence
* Simple responsive design for desktop and tablet views

---

## File Structure

```
/index.html       - Main interface to add, edit, and view student information
/records.html     - Detailed health records for each student
/style.css        - Application styling
/script.js        - Handles CRUD operations and form validations
```

---

## How to Use

1. Open `index.html` in your browser.
2. Use the **Add Student** form to input student details.
3. View all students in the table below the form.
4. Click on a student’s name to view or edit their health records in `records.html`.
5. Use the **search bar** to quickly find specific students.
6. All changes are automatically saved in the browser.

---

## Notes

* This application works **offline** as it uses local storage.
* Make sure to **backup your browser data** if you need to preserve student records long-term.
* Currently optimized for **modern browsers** (Chrome, Edge, Firefox).

---

## Future Improvements

* Add cloud database support for multi-device access.
* Implement PDF export of student and health records.
* Add user authentication for better privacy.
* Include mobile-responsive design for smartphones.
