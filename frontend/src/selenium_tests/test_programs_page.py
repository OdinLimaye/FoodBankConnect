# test_programs_page_load.py
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class ProgramsPageLoadTest(unittest.TestCase):

    def setUp(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")  # run without opening a browser window
        self.driver = webdriver.Chrome(options=options)
        self.wait = WebDriverWait(self.driver, 5)
        self.base_url = "https://foodbankconnect.me/programs"

    def test_page_loads(self):
        self.driver.get(self.base_url)
        # wait until at least one ProgramCard is present
        cards = self.wait.until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "card"))
        )
        self.assertGreater(len(cards), 0, "No program cards found")
        print("✅ Programs page loads and displays cards.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
